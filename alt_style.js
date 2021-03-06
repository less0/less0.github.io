$("#hamburger").on("click", element => {
  $(".top").toggleClass("selected");
  $(".middle").toggleClass("selected");
 
  $(".bottom").toggleClass("selected");
  $("nav").toggleClass("visible");
});

var disableHighlightingNavitemsOnScroll = false;

document.addEventListener('mousedown', function (event) {
  if (event.detail > 1) {
    event.preventDefault();
  }
}, false);

$(document).on("scroll", event => {
	if(disableHighlightingNavitemsOnScroll)
	{
		return;
	}
	
	var currentSection = $('section').filter((index, element) => $(element).position().top <= $(document).scrollTop()+50).last()[0];
	
	var matchingNavigationEntry = $("a").filter((index, element) => {
	var href = $(element).attr('href');
	return href.substring(href.indexOf("#")+1) == currentSection.id;
		})[0];
  if(!$(matchingNavigationEntry).hasClass("selected"))
    {
	$("nav>a").removeClass("selected");
	$(matchingNavigationEntry).addClass("selected");
    }
});

$(document).on("wheel mousewheel", event => {
	disableHighlightingNavitemsOnScroll = false;
});

$("nav>a").on("click", (obj) =>
             {
  disableHighlightingNavitemsOnScroll = true;
  $("nav>a").removeClass("selected");
  $(obj.target).addClass("selected");
});

var particles = {
    "particles": {
        "number": {
            "value": 80,
            "density": {
                "enable": true,
                "value_area": 800
            }
        },
        "color": {
            "value": "#000000"
        },
        "shape": {
            "type": "circle",
            "stroke": {
                "width": 0,
                "color": "#000000"
            },
            "polygon": {
                "nb_sides": 5
            },
            "image": {
                "src": "img/github.svg",
                "width": 100,
                "height": 100
            }
        },
        "opacity": {
            "value": 0.5,
            "random": false,
            "anim": {
                "enable": false,
                "speed": 1,
                "opacity_min": 0.1,
                "sync": false
            }
        },
        "size": {
            "value": 3,
            "random": true,
            "anim": {
                "enable": false,
                "speed": 40,
                "size_min": 0.1,
                "sync": false
            }
        },
        "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#000000",
            "opacity": 0.4,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 1,
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
                "enable": false,
                "rotateX": 600,
                "rotateY": 1200
            }
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": false,
                "mode": "repulse"
            },
            "onclick": {
                "enable": false,
                "mode": "push"
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 400,
                "line_linked": {
                    "opacity": 1
                }
            },
            "bubble": {
                "distance": 400,
                "size": 40,
                "duration": 2,
                "opacity": 8,
                "speed": 3
            },
            "repulse": {
                "distance": 200,
                "duration": 0.4
            },
            "push": {
                "particles_nb": 4
            },
            "remove": {
                "particles_nb": 2
            }
        }
    },
    "retina_detect": true
};

particlesJS("particles", particles);
