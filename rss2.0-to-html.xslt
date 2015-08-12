<?xml version='1.0' encoding='UTF-8'?>
<!-- Style RSS so that it is readable. -->
<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="1.0"

  xmlns:rss="http://purl.org/rss/1.0/"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	>

<xsl:template match='/rss'>
	<html>
		<head>
			<title>RSS feed for <xsl:value-of select='channel/title'/></title>
			<style type='text/css'>

			body {
				font-family: verdana, sans-serif;
				font-size: 80%; line-height: 1.45em;
			}

			h1, h2 {
				font-size: 100%;
			}

			img {
				border: none;
			}
			</style>
		</head>
		<body>
			<xsl:if test='rss:image/*'>
				<p><img src='{image/url}' /></p>
			</xsl:if>

			<h1>RSS feed for <xsl:value-of select='channel/title'/></h1>

			<p>This is an RSS feed for
					<a href='{channel/link}'><xsl:value-of select='channel/title'/></a> (<xsl:value-of select='channel/description'/>).
					If you don't know what an RSS feed, read the
					<a href='http://glenn.typepad.com/news/2003/05/a_brief_introdu.html#section1'>What's RSS?</a> page.
					This feed only includes the first paragraph from each posting, and strips
					out links and style information. It can be used to subscribe to the new posts, 
					using an aggregator like <a href="http://bloglines.com">bloglines</a> (a free online service).
					If you want to read the blog, use the <a href='http://blog.monstuff.com'>main blog</a> page.

          For instance, you can follow this feed <a href='http://cloud.feedly.com/#subscription%2Ffeed%2F{{index.RssUrl | UrlEncode}}'  target='blank'><!--<img id='feedlyFollow' src='http://s3.feedly.com/img/follows/feedly-follow-logo-green_2x.png' alt='follow us in feedly' width='28' height='28'>--> via Feedly</a>.
        

      </p>

			<xsl:apply-templates select='channel/item' />

            <p>This RSS feed is displayed using a variant of <a href="http://www.nedbatchelder.com">Ned Batchelder</a>'s XSL transform for RSS.</p>
		</body>
	</html>
</xsl:template>

<xsl:template match='item'>
	<h2>
		<a href='{link}'>
			<xsl:value-of select='title'/>
		</a>
	</h2>
	<p>
		<xsl:value-of select='description'/>
		<xsl:text> </xsl:text>
		<a href='{link}'>Read the blog entry</a>.
	</p>
</xsl:template>

</xsl:stylesheet>
