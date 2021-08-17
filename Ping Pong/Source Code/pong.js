window.addEventListener("keyup", ev => {
    if (ev.keyCode === 13) {
        // select canvas element
        const canvas = document.getElementById("pong");
        const ctx = canvas.getContext('2d');
        var name = prompt("enter your name");
        while (!(/^[a-zA-Z]+$/.test(name) && name)) {
            name = prompt("please, enter characters only and name cannot be empty");
        }


        // load sounds
        let hit = new Audio();
        let wall = new Audio();
        let userScore = new Audio();
        let comScore = new Audio();

        hit.src = "sounds/hit.mp3";
        wall.src = "sounds/wall.mp3";
        comScore.src = "sounds/comScore.mp3";
        userScore.src = "sounds/userScore.mp3";

        // create ball
        const ball = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            radius: 10,
            velocityX: 5,
            velocityY: 5,
            speed: 5,
            color: "white"
        }

        // create USER paddle
        const user = {
            x: 0, // left side of canvas
            y: (canvas.height - 100) / 2, // -100 the height of paddle
            width: 10,
            height: 100,
            score: 0,
            color: "red"
        }

        // create COM paddle
        const com = {
            x: canvas.width - 10, // - width of paddle
            y: (canvas.height - 100) / 2, // -100 the height of paddle
            width: 10,
            height: 100,
            score: 0,
            color: "blue"
        }

        // create net
        // const net = {
        //     x: (canvas.width - 2) / 2,
        //     y: 0,
        //     height: 10,
        //     width: 2,
        //     color: "WHITE"
        // }

        // draw a rectangle, will be used to draw paddles
        function drawRect(x, y, w, h, color) {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, w, h);
        }

        // draw circle, will be used to draw the ball
        function drawCircle(x, y, r, color) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        }

        // control user paddle
        canvas.addEventListener("mousemove", getMousePos);

        function getMousePos(evt) {
            let rect = canvas.getBoundingClientRect();

            user.y = evt.clientY - rect.top - user.height / 2;
        }

        // reset ball
        function resetBall() {
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            ball.velocityX = -ball.velocityX;
            ball.speed = 7;
        }

        // draw net
        // function drawNet() {
        //     for (let i = 0; i <= canvas.height; i += 15) {
        //         drawRect(net.x, net.y + i, net.width, net.height, net.color);
        //     }
        // }

        // draw text
        function drawText(text, x, y) {
            ctx.fillStyle = "white";
            ctx.font = "20px fantasy";
            ctx.fillText(text, x, y);
        }

        // collision detection
        // p => player, b=> ball
        function collision(b, p) {
            p.top = p.y;
            p.bottom = p.y + p.height;
            p.left = p.x;
            p.right = p.x + p.width;

            b.top = b.y - b.radius;
            b.bottom = b.y + b.radius;
            b.left = b.x - b.radius;
            b.right = b.x + b.radius;

            return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
        }

        // update : position, move, score ...
        function update() {

            // update score
            if (ball.x - ball.radius < 0) {
                // computer win
                com.score++;
                comScore.play();
                resetBall();
                if (com.score == 5) {
                    alert("Game Over" + ", " + "You Lose");
                    document.location.reload();
                }
            } else if (ball.x + ball.radius > canvas.width) {
                // user win
                user.score++;
                userScore.play();
                resetBall();
                if (user.score == 5) {
                    alert("Congratulations" + ", " + name + " Win");
                    document.location.reload();
                }
            }

            // the ball has a velocity
            ball.x += ball.velocityX;
            ball.y += ball.velocityY;

            // simple AI to control computer paddle
            com.y += ((ball.y - (com.y + com.height / 2))) * 0.1;

            // when the ball collides with bottom and top walls we inverse the y velocity.
            if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
                ball.velocityY = -ball.velocityY;
                wall.play();
            }

            // we check if the paddle hit the user or the com paddle
            let player = (ball.x + ball.radius < canvas.width / 2) ? user : com;

            // if the ball hits a paddle
            if (collision(ball, player)) {
                // play sound
                hit.play();

                // where ball hit player
                let collidePoint = (ball.y - (player.y + player.height / 2));

                // normalization
                collidePoint = collidePoint / (player.height / 2);

                // calculate angle in radian
                let angleRad = (Math.PI / 4) * collidePoint;

                // X direction of ball when it is hit
                let direction = (ball.x + ball.radius < canvas.width / 2) ? 1 : -1;

                // change velocity X and Y
                ball.velocityX = direction * ball.speed * Math.cos(angleRad);
                ball.velocityY = ball.speed * Math.sin(angleRad);

                // every time ball hit paddle, increase speed
                ball.speed += 0.5;
            }
        }

        // render game
        function render() {
            // clear canvas
            // drawRect(0, 0, canvas.width, canvas.height, "black");
            // drawImage("img/pingpongtable.jpg");

            var img = new Image();
            img.onload = function () {
                ctx.drawImage(img, 0, 0, 600, 400);
                // draw user score
                drawText(name + ": " + user.score, canvas.width / 4, canvas.height / 5);

                // draw COM score
                drawText("Computer: " + com.score, 3 * canvas.width / 4, canvas.height / 5);

                // draw user paddle
                drawRect(user.x, user.y, user.width, user.height, user.color);

                // draw COM paddle
                drawRect(com.x, com.y, com.width, com.height, com.color);

                // draw ball
                drawCircle(ball.x, ball.y, ball.radius, ball.color);
            }
            img.src = "img/pingpongtable.jpg";

            // draw net
            // drawNet();
        }

        // game init
        function game() {
            update();
            render();
        }
        // number of frames per second
        let framePerSecond = 50;

        //call the game function 50 times every 1 Sec
        setInterval(game, 1000 / framePerSecond);
    }
});