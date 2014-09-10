'use strict';

angular.module('app.components.widgets.fileUpload', [
  'app.components.widgets.fileUploadConfig',
  'angularFileUpload'
])
  .directive('fileUpload', function ($upload, $window, fileUploadConfig, FileUploadStatus) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: fileUploadConfig.templateUrl,
      scope: true,
      link: function (scope, element, attrs) {
        var options = scope.$eval(attrs.fileUpload);

        if (!options || !options.url) {
          throw 'Upload URL is not set';
        }

        scope.uploading = false;

        scope.onFileSelect = function($files) {
          if ($files.length !== 1) {
            throw 'Exactly one file is expected.';
          }

          var file = $files[0];

          var fileReader = new $window.FileReader();
          fileReader.readAsArrayBuffer(file);

          var status = new FileUploadStatus(scope, options, file);

          fileReader.onload = function(e) {
            scope.uploading = true;

            $upload.http({
              //url: 'upload',
              url: options.url,
              params: {
                filename: file.name
              },
              headers: {'Content-Type': file.type ? file.type : 'application/java-archive'},
              data: e.target.result
            }).then(status.success.bind(status), status.error.bind(status), status.notify.bind(status)); //TODO
          };
        };

        scope.closeAlert = function () {
          scope.alert = null;
        };
      }
    };
  })
  .factory('FileUploadStatus', function () {
    function UploadStatus(scope, options, file) {
      this.scope = scope;
      this.options = options;
      this.file = file;
    }

    angular.extend(UploadStatus.prototype, {
      success: function (response) {
        this.scope.uploading = false;
        this.updateProgress(0);

        this.scope.alert = {
          type: 'success',
          msg: 'File "' + this.file.name + '" is successfully uploaded'
        };

        if (this.options.success) {
          this.options.success(this.file, response);
        }
      },
      error: function (response) {
        this.scope.uploading = false;

        this.scope.alert = {
          type: 'danger',
          msg: 'File "' + this.file.name + '" upload failed',
          details: response.status + ' ' + response.statusText
        };

        if (this.options.error) {
          this.options.error(this.file);
        }
      },

      notify: function (event) {
        var progress = Math.round(100.0 * event.loaded / event.total);
        this.updateProgress(progress);
        console.log(event);
        console.log('progress ' + this.scope.progress); //TODO
      },

      updateProgress: function (value) {
        this.scope.progress = value > 5 ? value : 5;
      }
    });

    return UploadStatus;
  })
  .factory('FileUploadModal', function ($modal, fileUploadConfig) {
    function FileUploadModal(fileUploadOptions) {
      this.fileUploadOptions = fileUploadOptions;
    }

    angular.extend(FileUploadModal.prototype, {
      open: function () {
        var fileUploadOptions = this.fileUploadOptions;

        $modal.open({
          templateUrl: fileUploadConfig.modalTemplateUrl,
          controller: 'ModalInstanceCtrl',
          size: 'lg',
          resolve: {
            fileUploadOptions: function () {
              return fileUploadOptions;
            }
          }
        });
      }
    });

    return FileUploadModal;
  })
  .controller('ModalInstanceCtrl', function ($scope, $modalInstance, fileUploadOptions) {
    $scope.fileUploadOptions = {};

    angular.extend($scope.fileUploadOptions, fileUploadOptions);

    //override success callback to close the modal
    angular.extend($scope.fileUploadOptions, {
      success: function (fileItem) {
        $modalInstance.close(fileItem.name);

        if (fileUploadOptions.success) {
          fileUploadOptions.success(fileItem);
        }
      }
    });

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });