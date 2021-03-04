class FramePlayer {

    constructor(id) {
        this.imageCount = 6
        this.images = []
        this.characterCount = 0;

        this.fps = 10
        this.vidStop = false;

        this.canWidth = 650;
        this.canHeight = 300;

        this.frameCounter = 0;

        this.x = 0;
        this.y = 0;

        this.srcX = 0;
        this.srcY = 0;

        this.cols = 5
        this.rows = 5

        this.width = 640 / this.cols;
        this.height = 360 / this.rows;

        this.currentFrameX = 0;

        const canvas = document.getElementById(id);
        this.progress = document.getElementById('progress-bar');

        canvas.addEventListener('click', () => {
            if (this.vidStop) {
                this.play()
            } else {
                this.pause()
            }
        })

        canvas.width = this.canWidth;
        canvas.height = this.canHeight;
        this.ctx = canvas.getContext('2d');

        this.eventList = {
            ondownloadedcomplete: () => null,
            onplay: () => null,
            onpause: () => null,
            onend: () => null
        }
    }

    async #getAllImages() {
        var t0 = performance.now()
        for (let i = 0; i <= this.imageCount; i++) {
            const result = await fetch(`http://localhost:3000/images/${i}.jpg`)
            const blob = await result.blob()
            const reader = new FileReader()
            reader.onloadend = ({ currentTarget: { result } }) => {
                const img = new Image()
                img.src = result
                this.images.push(img)
            }
            reader.readAsDataURL(blob)
        }
        var t1 = performance.now()

        this.eventList['ondownloadedcomplete'](t1 - t0)

    }

    #updateFrame() {
        this.currentFrameX = ++this.currentFrameX % this.cols;
        this.srcX = this.currentFrameX * this.width
        this.frameCounter += 1;
        this.progress.value = this.frameCounter;
        console.log('x = ' + this.srcX + ' y = ' + this.srcY)
    }

    #drawImage() {
        this.#updateFrame();
        this.ctx.drawImage(this.images[this.characterCount], this.srcX, this.srcY, this.width, this.height, this.x, this.y, this.canWidth, this.canHeight);
        if (this.srcX == 512) {
            this.srcY += this.height;
        }

        if (this.srcY == 360 && this.characterCount <= 6) {
            if (this.characterCount == 6) {
                this.eventList['onend']()
                clearInterval(this.interval)
            }
            else {
                this.characterCount++;
                this.srcY = 0;
            }
        }
    }


    async play() {
        this.vidStop = false
        if (this.images.length == 0) {
            await this.#getAllImages()
        }

        this.interval = setInterval(() => {
            this.#drawImage()
        }, 1000 / this.fps);

        this.eventList['onplay'](performance.now())
    }

    pause() {
        clearInterval(this.interval)
        this.vidStop = true
        this.eventList['onpause'](performance.now())
    }


    on(eventName, callback) {
        this.eventList[eventName] = callback
    }

}


const player = new FramePlayer('canvas')


player.on('ondownloadedcomplete', (ms) => {
    console.log('downloaded completed in ' + ms);
})

player.on('onplay', (ms) => {
    console.log('video is playing now ' + ms)
})

player.on('onpause', (ms) => {
    console.log('video is paused ' + ms)
})

player.on('onend', () => {
    console.log('video is completed')
})

player.play()