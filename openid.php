<?
# Copyright (c) 2005 JP Sugarbroad
# Permission is granted to use this in any way you want, provided that you
# include the above copyright notice (or one with similar effect) in any work
# including non-trivial parts of this one.

# Change history:
#     20050706.0: Fixed XTEA routines and signatures
#     20050707.0: More XTEA fixes
#     20050707.1: valid_root fix (thanks to meepbear)
#     20050708.0: Fix cookie check
#     20050708.1: Remove issued field from token

define("SIGKEY", "something");
define("COOKIE_NAME", "secret");
define("COOKIE_VALUE", "cookie");
define("VALID_TIME", 5 * 60); # token validity time
define("ASSOC_REPLACE", 10 * 60); # association replace time
define("ASSOC_TIME", 15 * 60); # assocation validity time
define("KEY_LEN", 20); # Don't touch me

function t2utc($t) {
    return gmdate("Y-m-d\\TH:i:s\\Z", $t);
}

function utc2t($s) {
    return strtotime(str_replace("T", " ", $s));
}

# * is NOT OK
# *.x is NOT OK
# *.x.<tld_list non-element> is NOT OK
# Anything else is OK
# List from: http://www.iana.org/gtld/gtld.htm
$tld_list = array(
    "aero" => 1,
    "biz" => 1,
    "com" => 1,
    "coop" => 1,
    "edu" => 1,
    "gov" => 1,
    "info" => 1,
    "int" => 1,
    "mil" => 1,
    "museum" => 1,
    "name" => 1,
    "net" => 1,
    "org" => 1,
    "pro" => 1);

function valid_wildcard($h) {
    switch (strrpos($h, "*")) {
    case false:
        # Not wildcard
        return true;
    case 0:
        # Wildcard
        break;
    default:
        # * not at start
        return false;
    }
    $h = explode(".", $h);
    if ($h[0] != "*") return false; # *xyz.stuff is bad
    switch (count($h)) {
    case 0:
    case 1:
    case 2:
        return false;
    case 3:
        return array_key_exists($h[-1], $tld_list);
    default:
        return true;
    }
}

function valid_root($root, $ret) {
    $root = parse_url($root);
    if (isset($root["fragment"])) return false;
    $ret = parse_url($ret);
    if ($root["scheme"] != $ret["scheme"]) return false;
    if ($root["port"] != $ret["port"]) return false;
    if (isset($root["user"]) && $root["user"] != $ret["user"]) return false;
    if (isset($root["pass"]) && $root["pass"] != $ret["pass"]) return false;
    if (isset($root["query"]) && $root["query"] != $ret["query"]) return false;
    $h = $root["host"];
    if (!valid_wildcard($h)) return false;
    if ($h[0] == "*") {
        $hn = strlen($h) - 1;
        if (substr($h, 2) != substr($ret["host"], -$hn, $hn)) return false;
    } else {
        if ($h != $ret["host"]) return false;
    }
    $p1 = explode("/", rtrim($root["path"], "/"));
    $p2 = explode("/", rtrim($ret["path"], "/"));
    foreach ($p1 as $k => $v) {
        if ($p2[$k] != $v) return false;
    }
    return true;
}

function randbytes($n) {
    $r = fopen("/dev/urandom", "rb");
    $s = fread($r, $n);
    fclose($r);
    return $s;
}

function xtea_block($k, $v) {
    list(, $v0, $v1) = unpack("N*", $v);
    $sum = 0;
    $delta = 0x9E3779B9;
    for ($i = 0; $i < 32; $i++) {
        $v0 = intval($v0 + ($v1 << 4 ^ $v1 >> 5) + $v1 ^ $sum + $k[$sum & 3]);
        $sum = intval($sum + $delta);
        $v1 = intval($v1 + ($v0 << 4 ^ $v0 >> 5) + $v0 ^ $sum + $k[$sum >> 11 & 3]);
    }
    return pack("N2", $v0, $v1);
}

function xtea_encrypt($key, $data) {
    $key = array_merge(unpack("N*", str_pad($key, 16, chr(0))));
    $v = randbytes(8);
    $out = $v;
    $i = 0;
    $l = strlen($data);
    while ($i < $l) {
        $v = xtea_block($key, $v);
        $p = substr($data, $i, 8);
        $i += 8;
        $v ^= $p;
        $out .= $v;
    }
    return $out;
}

function xtea_decrypt($key, $data) {
    $key = array_merge(unpack("N*", str_pad($key, 16, chr(0))));
    $v = substr($data, 0, 8);
    $i = 8;
    $l = strlen($data);
    $out = "";
    while ($i < $l) {
        $v = xtea_block($key, $v);
        $c = substr($data, $i, 8);
        $i += 8;
        $out .= $v ^ $c;
        $v = $c;
    }
    return $out;
}

define("HASH_LEN", 20);
function hmac($key, $str) {
    $key = str_pad($key, 64, chr(0));
    $ipad = $key ^ str_repeat(chr(0x36), 64);
    $opad = $key ^ str_repeat(chr(0x5C), 64);

    return pack("H*", sha1($opad . pack("H*", sha1($ipad . $str))));
}

function sign_array($key, $data) {
    $token = "";
    foreach (explode(",", $data["signed"]) as $f) {
        $token .= "$f:$data[$f]\n";
    }
    return base64_encode(hmac($key, $token));
}

function make_handle($expiry, $key) {
    $token = pack("l", $expiry) . $key;
    return base64_encode(xtea_encrypt(SIGKEY, hmac(SIGKEY, $token) . $token));
}

function check_handle($bh) {
    $handle = base64_decode($bh);
    # IV + HMAC + expiry
    if (!$handle || strlen($handle) < 8 + HASH_LEN + 4) return false;
    $handle = xtea_decrypt(SIGKEY, $handle);
    $data = substr($handle, HASH_LEN);
    if (hmac(SIGKEY, $data) != substr($handle, 0, HASH_LEN)) return false;
    list(, $expiry) = unpack("l", $data);
    if ($expiry < time()) return false;
    return substr($data, 4);
}

function make_args($prefix, $data) {
    $url = "";
    foreach ($data as $k => $v) {
        $url .= "$prefix$k=" . urlencode($v) . "&";
    }
    return rtrim($url, "&");
}

function continuation() {
    $url = "";
    foreach ($_REQUEST as $k => $v) {
        if (strncmp($k, "openid_", 7) || $k == "openid_mode") continue;
        $url .= "&openid." . substr($k, 7) . "=" . urlencode($v);
    }
    return $url;
}

$ret = $_REQUEST["openid_return_to"];
if ($ret) {
    if (!preg_match("/^https?:/", $ret)) {
        header("HTTP/1.0 400 Bad Request");
        ?><html>
            <head><title>Bad Request</title></head>
            <body><p>The OpenID endpoint received an invalid request.</p></body>
        </html><?
        exit;
    }
    if (strchr($ret, "?")) {
        $retp = "$ret&";
    } else {
        $retp = "$ret?";
    }
}

function badreq($msg) {
    global $ret, $retp;
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        header("HTTP/1.0 400 Bad Request");
        print "error:$msg\n";
        exit;
    }
    if ($ret) {
        header("Location: " . $retp . "openid.mode=error&openid.error=" . urlencode($msg));
    } else {
        header("HTTP/1.0 400 Bad Request");
    }
    ?><html>
        <head><title>OpenID endpoint</title></head>
        <body><p>This is an OpenID server endpoint, not a human-readable resource. For more information, see <a href="http://openid.net/">http://openid.net/</a>.</p>
        <? if ($msg) { ?>
            <p>An error occurred processing your request: <?=htmlspecialchars($msg)?></body>
        <? } ?>
    </html><?
    exit;
}

$mode = $_REQUEST["openid_mode"];
switch ($mode) {
case "check_authentication":
    $resp = array();
    $sig = $_REQUEST["openid_signed"];
    $resp["signed"] = $sig;
    foreach (explode(",", $sig) as $f) {
        $resp[$f] = $_REQUEST["openid_" . $f];
    }
    $resp["mode"] = "id_res";

    header("Content-Type: text/plain");
    $key = check_handle($_REQUEST["openid_assoc_handle"]);
    if ($key && $_REQUEST["openid_sig"] == sign_array($key, $resp)) {
        $l = max(0, utc2t($resp["valid_to"]) - time());
        print "is_valid:" . ($l ? 1 : 0) . "\nlifetime:" . $l . "\n";
    } else {
        print "is_valid:0\nlifetime:0\n";
    }
    $ih = $_REQUEST["openid_invalidate_handle"];
    if ($ih && !check_handle($ih)) {
        print "invalidate_handle:$ih\n";
    }
    exit;
case "associate":
    $t = $_REQUEST["openid_assoc_type"];
    if (isset($t) && $t != "HMAC-SHA1") badreq("Unknown association type");
    $t = time();
    $e = $t + ASSOC_TIME;
    $r = randbytes(KEY_LEN);
    $handle = make_handle($e, $r);
    header("Content-Type: text/plain");
    print "assoc_type:HMAC-SHA1\nassoc_handle:" . $handle .
          "\nissued:" . t2utc($t) .
          "\nreplace_after:" . t2utc($t + ASSOC_REPLACE) .
          "\nexpiry:" . t2utc($e) .
          "\nmac_key:" . base64_encode($r) .
          "\n";
    exit;
case "login":
case "checkid_immediate":
case "checkid_setup":
    if ($_SERVER["REQUEST_METHOD"] != "GET") {
        badreq("Mode $mode requires GET method");
    }
    break;
case null:
    badreq(null);
default:
    badreq("Unknown mode $mode");
}

if (!$ret) badreq("return_to required");
# If we have checkid_setup issue a redirect with mode login, then we don't
# have to make this a function. But that's an extra redirect we don't need.
function login() {
    global $mode, $retp;
    # TODO have the user log in
    # if (got_valid_login) {
    setcookie(COOKIE_NAME, COOKIE_VALUE, 0, $_SERVER["PHP_SELF"]);
    $_COOKIE[COOKIE_NAME] = COOKIE_VALUE;
    $mode = "checkid_immediate";
    # } elif (login_canceled) {
    #     header("Location: " . $retp . "openid.mode=cancel");
    #     exit;
    # } else {
    #     request_login
    #     exit;
    # }
}
if ($mode == "login") login();

if ($_COOKIE[COOKIE_NAME] != COOKIE_VALUE) {
    if ($mode == "checkid_setup") {
        login();
    } else {
        $url = "http://$_SERVER[SERVER_NAME]$_SERVER[PHP_SELF]?openid.mode=login" . continuation();
        $url = $retp . "openid.mode=id_res&openid.user_setup_url=" . urlencode($url);
        header("Location: $url");
        ?><html>
            <head><title>Login required</title></head>
            <body><p>You need to <a href="<?=htmlspecialchars($url)?>">log in</a> to be authenticated.</p></body>
        </html><?
        exit;
    }
}

$id = $_REQUEST["openid_identity"];
#if ($id != "http://taral.net/") badreq("Unrecognized identity");

$root = $_REQUEST["openid_trust_root"];
if (!$root || !valid_root($root, $ret)) {
    $root = $ret;
}
switch ($root) {
    case "http://www.lifewiki.net/":
    case "http://*.danga.com/openid/demo/":
        break;
    default:
        badreq("Requester not trusted");
}

$resp = array(
    "mode" => "id_res",
    "identity" => $id,
    "valid_to" => gmdate("Y-m-d\\TH:i:s\\Z", time() + VALID_TIME),
    "return_to" => $ret,
    "signed" => "mode,valid_to,identity,return_to");
$handle = $_REQUEST["openid_assoc_handle"];
if ($handle) {
    $key = check_handle($handle);
    if ($key == false) $resp["invalidate_handle"] = $handle;
}
if (!$key) {
    $key = randbytes(KEY_LEN);
    $handle = make_handle(time() + ASSOC_TIME, $key);
}
$resp["sig"] = sign_array($key, $resp);
$resp["assoc_handle"] = $handle;
$url = $retp . make_args("openid.", $resp);
header("Location: $url");
?><html>
    <head><title>Authentication OK</title></head>
    <body><p>Authentication complete. <a href="<?=htmlspecialchars($url)?>">Click here to proceed</a></p></body>
</html>
