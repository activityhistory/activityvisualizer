//Makes an asynchronous request, loading the getimages.php file
function callForImages() {

    //Create the request object
    var httpReq = (window.XMLHttpRequest)?new XMLHttpRequest():new ActiveXObject("Microsoft.XMLHTTP");

    //When it loads,
    httpReq.onload = function() {

        var img_data = []

        //Convert the result back into JSON
        var result = JSON.parse(httpReq.responseText);
        for(var i = 0; i < result.length; i++){
            var filename_elements = result[i].split("_");
            var x = filename_elements[1];
            var y = filename_elements[2].split(".")[0];
            img_data.push([result[i], x, y]);
        }

        //Show the images
        loadImages(img_data);
    }

    //Request the page
    try {
        httpReq.open("GET", "small_multiples.php", true);
        httpReq.send(null);
    } catch(e) {
        console.log(e);
    }
}

//Generates the images and sticks them in the container
function loadImages(images) {

    // starting snippet image size
    var imgW = 100;

    var tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")

    tooltip.append('p')
        .text("Hello")
        .attr("id","tooltip_text")

    tooltip.append("img")
            .attr("src", "benchmark.png")
            .attr("id", "tooltip_image");

    var multiples = d3.select('#images').selectAll('.clickDiv')
        .data([]);

    // only grab 20 images to start
    var reduced_images = [];
    var jump_by = parseInt(images.length/20)
    for(var i = 0; i < images.length; i=i+jump_by) {
            reduced_images.push(images[i]);
    }

    // add images to page in a div used for cropping
    d3.select('#images').selectAll('div')
        .data(reduced_images)
        .enter().append('div')
        .attr('class', 'clickDiv')
        .append('img')
            .attr('class', 'clickImg')
            .attr('src', function(d){return d[0]})
            .on("mouseover", function(){
                tooltip.style("visibility", "visible")
                var imgsrc = this.getAttribute("src");
                d3.select("#tooltip_image").attr("src", function(){ return imgsrc});
                imgsrc = imgsrc.split("/").pop()
                d3.select("#tooltip_text").text( function(){ return imgsrc.substring(2,4) + "/" + imgsrc.substring(4,6) + "/" + imgsrc.substring(0,2) + " - " + imgsrc.substring(7,9) + ":" + imgsrc.substring(9,11) });
                var rect = this.parentNode.getBoundingClientRect();
                tooltip.style("top", (rect.bottom + document.body.scrollTop + 10)+"px").style("left",(rect.left)+"px");
            })
            .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

    d3.selectAll('.clickImg')
        .style('top', function(d){return -( this.clientHeight - d[2]) + imgW/2 + 'px'})
        .style('left', function(d){return  -d[1] + imgW/2 + 'px'})


    // resize and reposition images on change of image size
    $("#windowSize").slider({max:800},{min:50},{value:100},{slide: function( event, ui ) {
        d3.selectAll('.clickDiv')
            .style('height', function(){return ui.value+'px'})
            .style('width', function(){
                if ($('input[name=radio]:checked', '#aspectForm').val() == "aspect1610"){
                    return Math.round(ui.value*1.6)+'px';
                }
                else { return ui.value+'px'; }
                })
            .selectAll('.clickImg')
                .style('top', function(d){return -(this.clientHeight - d[2]) + ui.value/2 + 'px'})
                .style('left', function(d){return  -d[1] + ui.value/2 + 'px'});

            if ($('input[name=radio]:checked', '#aspectForm').val() == "aspect1610"){
                   imgW = Math.round(ui.value*1.6);
                }
                else { imgW = ui.value; }
            imgH = ui.value;

            document.getElementById('sizeText').innerHTML = 'Thumbnail Size: ' + ui.value;
                imgW = ui.value;
    }});

    // get new set of images when slider for # of images changes
    $("#numOfImages").slider({max:200},{min:10},{step:5},{value:20},{slide: function( event, ui ) {
        var reduced_images = [];
        var jump_by = parseInt(images.length/ui.value)
        for(var i = 0; i < images.length; i=i+jump_by) {
                reduced_images.push(images[i]);
        }

        multipleDivs = d3.select('#images').selectAll('.clickDiv')
            .data([])
            .exit().remove();

        multiples = d3.select('#images').selectAll('img')
            .data(reduced_images)
            .enter().append('div')
            .attr('class', 'clickDiv')
            .attr('width', imgW)
            .attr('height', imgW)
            .append('img')
                .attr('class', 'clickImg')
                .attr('src', function(d){return d[0]})
                .on("mouseover", function(){
                    tooltip.style("visibility", "visible")
                    var imgsrc = this.getAttribute("src")
                    d3.select("#tooltip_image").attr("src", function(){ return imgsrc})
                    imgsrc = imgsrc.split("/").pop()
                    d3.select("#tooltip_text").text( function(){ return imgsrc.substring(2,4) + "/" + imgsrc.substring(4,6) + "/" + imgsrc.substring(0,2) + " - " + imgsrc.substring(7,9) + ":" + imgsrc.substring(9,11) });
                    var rect = this.parentNode.getBoundingClientRect();
                    tooltip.style("top", (rect.bottom + document.body.scrollTop + 10)+"px").style("left",(rect.left)+"px");
                })
                .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

        multiples
            .style('top', function(d){return -(this.clientHeight - d[2]) + imgW/2 + 'px'})
            .style('left', function(d){return -d[1] + imgW/2 + 'px'});

        document.getElementById('numImageText').innerHTML = '# of images: ' + ui.value;
    }});

    // Go to the index page if the page selection changes
    $('#myForm input').on('change', function() {
            if ($('input[name=radio]:checked', '#myForm').val() == "dayview"){
                window.location.href = "index.html";
            }
            if ($('input[name=radio]:checked', '#myForm').val() == "weekview"){
                window.location.href = "index.html";
            }
        });

}
