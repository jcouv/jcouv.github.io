---
title: Test
layout: page
---

<script type="text/javascript"
        src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML">

    MathJax.Hub.Config({ styles: {
        ".MathJax": {
            color: "#FFCC00"
        }
    }
    })

</script>


MathJax.Hub.Config({
      tex2jax: {
        skipTags: ['script', 'noscript', 'style', 'textarea', 'pre']
      }
    });
    
    MathJax.Hub.Queue(function() {
        var all = MathJax.Hub.getAllJax(), i;
        for(i=0; i < all.length; i += 1) {
            all[i].SourceElement().parentNode.className += ' has-jax';
        }
    });
    
http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML

Testing [Google](http://google.com)

x^2


\\( 1/x^{2} \\) (Good)

\\[ \frac{1}{n^{2}} \\] (Good)

$$
\\( 1/x^{2} \\)
$$

(Weird)

$$
\\[ \frac{1}{n^{2}} \\]
$$

(Broken)

$$\mathbf{Y}$$

(Good)

$$ 
P(\mathbf{Y} = \mathbf{y}|\mathbf{X}) = exp[{\theta } ^{T} g(\mathbf{y},\mathbf{X})]/k(\theta ) 
$$

(Good)
