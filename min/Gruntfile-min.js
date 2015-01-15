module.exports=function(t){"use strict";t.initConfig({pkg:t.file.readJSON("package.json"),banner:'/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>; Licensed <%= props.license %> */\n',concat:{options:{banner:"<%= banner %>",stripBanners:!0},dist:{src:["lib/activityvisualizer.js"],dest:"dist/activityvisualizer.js"}},uglify:{options:{banner:"<%= banner %>"},dist:{src:"<%= concat.dist.dest %>",dest:"dist/activityvisualizer.min.js"}},jshint:{options:{node:!0,curly:!0,eqeqeq:!0,immed:!0,latedef:!0,newcap:!0,noarg:!0,sub:!0,undef:!0,unused:!0,eqnull:!0,browser:!0,globals:{jQuery:!0},boss:!0},gruntfile:{src:"gruntfile.js"},lib_test:{src:["lib/**/*.js","test/**/*.js"]}},qunit:{files:["test/**/*.html"]},watch:{gruntfile:{files:"<%= jshint.gruntfile.src %>",tasks:["jshint:gruntfile"]},lib_test:{files:"<%= jshint.lib_test.src %>",tasks:["jshint:lib_test","qunit"]}}}),t.loadNpmTasks("grunt-contrib-concat"),t.loadNpmTasks("grunt-contrib-uglify"),t.loadNpmTasks("grunt-contrib-qunit"),t.loadNpmTasks("grunt-contrib-jshint"),t.loadNpmTasks("grunt-contrib-watch"),t.registerTask("default",["jshint","qunit","concat","uglify"])};