module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadTasks('./tasks');

  grunt.initConfig({
    compile_dir: 'dist',
    src: {
      nadion: [
        'src/nadion.js',
        'src/controls.js',
        'src/level.js',
        'src/statemachine.js',
        'src/entities.js',
        'src/.js'
      ]
    },
    pkg: grunt.file.readJSON('package.json'),
    clean: ['<%= compile_dir %>'],
    concat: {
      nadion: {
        options: {
          process: {
            data: {
              version: '<%= pkg.version %>',
              buildDate: '<%= grunt.template.today() %>'
            }
          }
        },
        src: ['<%= src.nadion %>'],
        dest: '<%= compile_dir %>/nadion.js'
      }
    },
    uglify: {
      nadion: {
        options: {
          banner: '/*! Nadion v<%= pkg.version %> | (c) 2013 Joshua C Shepard */\n'
        },
        src: '<%= concat.nadion.dest %>',
        dest: '<%= compile_dir %>/nadion.min.js'
      }
    },
    connect: {
      root: {
        options: {
          keepalive: true
        }
      }
    }
  });

  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['clean', 'concat', 'uglify']);

};
