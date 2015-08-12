---
title: Getting videos out of iTunes U
---
I wanted to get a video out of iTunes U for viewing offline without iTunes or special apps.

The solution I found is to browse the iTunes U app in iOS and share a course by mail (see screenshot below).
This sends out a link (like this [one](https://itunes.apple.com/us/itunes-u/partnership-for-urban-health/id405936169?mt=10)) which offers a web preview of the content.
Luckily, the source of those preview pages also includes direct links to the media files.
  


Screenshot of sharing a course from iTunes U:

<img src="http://i57.tinypic.com/2ynexj5.png" width="320" height="568" />

  

Screenshot of the email you receive:

![mail screenshot](http://i57.tinypic.com/34ysec3.png)
  

Look at the source code to find the video link:

        preview-album="Partnership for Urban Health Research - Media" 
        preview-artist="Judea Pearl" 
        preview-title="Theoretical Developments in Causal Inference" 
        video-preview-url="https://itunesu.assets.itunes.com/apple-assets-us-std-000001/CobaltPublic6/v4/28/6b/19/286b19a3-2022-2477-ca6d-8e66edbc86c9/efa4eafb3b64ff58b40bf2aea0f12fb3825e5fc48d00e7545215357de42dcd42-3468512126.mov"
