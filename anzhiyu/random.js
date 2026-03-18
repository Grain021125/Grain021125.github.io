var posts=["2026/03/17/KMP算法/","2026/03/14/TinyCoro项目-2-tinyCoro介绍/","2026/03/14/TinyCoro项目-1-io-uring异步IO/","2026/03/13/hello-world/","2026/03/15/TinyCoro项目-3-tinyCoroLab-1/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };