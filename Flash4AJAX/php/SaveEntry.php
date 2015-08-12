<?php

/*
 * Copyright 2005 Julien Couvreur
 *
 * This file is part of DumkyWiki.
 */
 
// expects a POST
// expects a wikiword querystring parameter
// expects a JSON-encoded body with an entry and a version

// returns a JSON-encoded response with status, remoteentry and remoteversion


require_once('JSON.php');
$json = new Services_JSON();

header("Cache-Control: no-cache");

function SaveFile($wikiword, $text) {
  $path = "files/" . $wikiword;
  
  if (strlen($text) > 6000) {
    $shorttext = substr($text, 0, 6000);
    $shorttext .= "\r\n[Hit size limit - text truncated]";
  } else {
    $shorttext = $text;
  }
  
  $handle = fopen($path, "w");
  fwrite($handle, $shorttext);
  fclose($handle);
}


$wikiword = $HTTP_GET_VARS["wikiword"];


if ($_SERVER['REQUEST_METHOD'] == "GET") {
?>
asdf

<?php
} else {
	$input = $GLOBALS['HTTP_RAW_POST_DATA'];
	$value = $json->decode($input);



	class Response {
	   var $status;
	   var $remoteentry;
	   var $remoteversion;
	}

	$response = new Response();
	$response->remoteentry = $value->entry;
	$response->remoteversion = 0;
	$response->status = "failed";

	SaveFile($wikiword, $value->entry);
	$response->status = "saved";


	$output = $json->encode($response);
	print($output);
}

?>