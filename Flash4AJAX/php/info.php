<?php

//phpinfo();
//xdiff_file_diff_binary ();

$output = shell_exec('man diff');
echo "<pre>$output</pre>";

?>
