<?php

/*
 * Copyright 2005 Julien Couvreur
 *
 * This file is part of DumkyWiki.
 */
 
// expects a wikiword querystring parameter
// returns a JSON-encoded response with entry and version (version is always 0 for now)


require_once('JSON.php');
$json = new Services_JSON();


header("Cache-Control: no-cache");

function LoadFile($wikiword) {
  $path = "files/" . $wikiword;
  $handle = fopen($path, "r");
  
  if (!$handle) { return "Error loading file"; }

  $size = filesize($path);
  if ($size > 0) {
    $text = fread($handle, $size);
  } else {
    $text = "";
  }
  fclose($handle);

  return $text;
}




//$isUI = !isset($HTTP_GET_VARS["noui"]);
$wikiword = $HTTP_GET_VARS["wikiword"];


class Response {
   var $entry;
   var $version;
}

$response = new Response();
$response->entry = LoadFile($wikiword);
$response->version = 0;

$output = $json->encode($response);
print($output);

?>