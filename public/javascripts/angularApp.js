angular.module('flapperNews', ['ui.router'])
.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: '/home.html',
        controller: 'MainCtrl',
        resolve: ['posts', function(posts) {
          return posts.getAll();
        }]
      })
      .state('posts', {
        url: '/posts/{id}',
        templateUrl: '/posts.html',
        controller: 'PostsCtrl',
        resolve: {
          post: ['$stateParams', 'posts', function($stateParams, posts) {
            return posts.get($stateParams.id);
          }]
        }
      });

    $urlRouterProvider.otherwise('home');
  }])
.factory('posts', ['$http', function($http){
  var o = {
    posts: [
      // {title: 'post 1', upvotes: 5},
      // {title: 'post 2', upvotes: 2},
      // {title: 'post 3', upvotes: 15},
      // {title: 'post 4', upvotes: 9},
      // {title: 'post 5', upvotes: 4},
    ]
  };

  o.getAll = function() {
    return $http.get('/posts').success(function(data) {
      angular.copy(data, o.posts);
    });
  };

  o.create = function(post) {
    return $http.post('/posts', post).success(function(data) {
      o.posts.push(data);
    });
  };

  o.upvote = function(post) {
    return $http.put('/posts/' + post._id + '/upvote').success(function(data) {
      post.upvotes += 1;
    });
  };

  o.downvote = function(post) {
    return $http.put('/posts/' + post._id + '/upvote').success(function(data) {
      post.upvotes -= 1;
    });
  };

  o.get = function(id) {
    return $http.get('/posts/' + id).then(function(res) {
      return res.data;
    });
  };

  o.addComment = function(post, comment) {
    return $http.post('/posts/' + post._id + '/comments', comment);
  };

  o.upvoteComment = function(post, comment) {
    return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote').success(function(data) {
      comment.upvotes += 1;
    });  
  };

  o.downvoteComment = function(post, comment) {
    return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote').success(function(data) {
      comment.upvotes -= 1;
    });  
  };

  return o;
}])
.controller('MainCtrl', ['$scope', 'posts', function($scope, posts){
  $scope.posts = posts.posts;
  $scope.hideForm = true;

  $scope.addPost = function(){
    if ($scope.title === '') {
      return;
    }
    posts.create({
      title: $scope.title,
      link: $scope.link,
    });
    $scope.title = '';
    $scope.link = '';
  };

  $scope.incrementUpvotes = function(post) {
    posts.upvote(post);
  };

  $scope.decrementUpvotes = function(post) {
    posts.downvote(post);
  };

  $scope.toggleForm = function() {
    $scope.hideForm = !($scope.hideForm);
  };
}])
.controller('PostsCtrl', ['$scope', 'posts', 'post', function($scope, posts, post){
  $scope.post = post;
  $scope.hideForm = true;

  $scope.incrementUpvotes = function(comment) {
    posts.upvoteComment(post, comment);
  };

  $scope.decrementUpvotes = function(comment) {
    posts.downvoteComment(post, comment);
  };

  $scope.addComment = function(){
    if ($scope.body === '') {
      return;
    }
    posts.addComment(post, {
      body: $scope.body,
      author: 'user'
    }).success(function(comment) {
      $scope.post.comments.push(comment);
    });
    $scope.body = '';
  };

  $scope.toggleForm = function() {
    $scope.hideForm = !($scope.hideForm);
  };
}]);
