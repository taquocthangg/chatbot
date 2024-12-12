module.exports = {
    apps: [
      {
        name: "chatbot",            
        script: "nodemon",       
        args: "--exec babel-node index.js", // Chạy với babel-node và index.js
        watch: true,               // Theo dõi các thay đổi trong mã nguồn và tự động restart
        env: {
          NODE_ENV: "development"  // Môi trường phát triển
        }
      }
    ]
  };
  