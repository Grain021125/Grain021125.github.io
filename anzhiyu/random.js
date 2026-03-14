var posts=["2026/03/13/hello-world/","2026/03/14/TinyCoro项目-1-io-uring异步IO/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };