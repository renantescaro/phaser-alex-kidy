var config = {
    type: Phaser.AUTO,
    width: window.innerWidth-10,
    height: window.innerHeight-20,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

var teclaEsc
var teclaPulo
var game
var map
var player
var stars
var saida
var inimigos
var platforms
var chao
var cursors
var score = 0
var vida = 100
var scoreText
var nPulos = 0
var btnAndarEsquerda
var btnAndarDireita

function preload(){
    this.load.image('fundo',             'assets/fundo.jpg')
    this.load.image('inimigo',           'assets/inimigo.png')
    this.load.image('chao',              'assets/chao.png')
    this.load.image('star',              'assets/star.png')
    this.load.image('saida',             'assets/saida.png')
    this.load.image('bomb',              'assets/bomb.png')
    this.load.image('plataforma',        'assets/plataforma.png')
    this.load.image('plataformaPequena', 'assets/platformPequenaa.png')

    // personagem principal
    this.load.spritesheet('personagem', 'assets/personagem.png', { frameWidth: 98, frameHeight: 140 })
}

function create(){
    // *** Cenário ***

    // background
    this.add.image(400,  330, 'fundo')
    this.add.image(1600, 300, 'fundo')
    this.add.image(2800, 330, 'fundo')
    this.add.image(4000, 330, 'fundo')
    this.add.image(5200, 330, 'fundo')

    platforms = this.physics.add.staticGroup()
    chao = this.physics.add.staticGroup()

    // chão
    platforms.create(400,  670, 'chao').setScale(1).refreshBody()
    platforms.create(1100, 670, 'chao').setScale(1).refreshBody()
    platforms.create(2500, 670, 'chao').setScale(1).refreshBody()
    platforms.create(3500, 670, 'chao').setScale(1).refreshBody()

    // plataformas
    platforms.create(600,  545, 'plataforma')
    platforms.create(1000, 360, 'plataforma')
    platforms.create(1400, 300, 'plataforma')
    platforms.create(2050, 400, 'plataforma')
    platforms.create(2450, 400, 'plataforma')
    platforms.create(2650, 400, 'plataforma')
    platforms.create(2850, 400, 'plataforma')
    platforms.create(3050, 450, 'plataforma')
    platforms.create(3180, 230, 'plataforma')
    platforms.create(3580, 230, 'plataforma')

    saida  = this.physics.add.sprite(3580, 170,'saida')
    player = this.physics.add.sprite(100, 450, 'personagem')

    // camera
    this.cameras.main.setBounds(0,0,1920*2, 700)
    this.physics.world.setBounds(0,0,1920*2,700)
    this.cameras.main.startFollow(player, true, 0.05, 0.05)
    
    player.setBounce(0)
    player.setCollideWorldBounds(true)
    
    this.physics.add.collider(player, platforms)

    // Animações
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('personagem', { start: -1, end: 3 }),
        frameRate: 10,
        repeat: -1
    })
    
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('personagem', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    })

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'personagem', frame: 4 } ],
        frameRate: 20
    })

    teclaEsc  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    teclaPulo = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    cursors   = this.input.keyboard.createCursorKeys()

    // inimigos

    // grupo de 30 inimigos, a cada 205 px, a partir de 1000 px do inicio de x
    stars = this.physics.add.group({
        key: 'star',
        repeat: 30,
        setXY: { x: 1000, y: 0, stepX: 205 }
    })
    
    inimigos = this.physics.add.group();

   scoreText = this.add.text(100, 100, 'Pontos: 0  Vida: 100', { fontSize: '32px', fill: '#000' });

   // adiciona colisão entre as inimigos e as plataformas
   this.physics.add.collider(stars, platforms);
   this.physics.add.collider(inimigos, platforms);
   this.physics.add.collider(saida, platforms);
   
   // quando player sobrepor uma estrela, chama o metodo collectStar
   this.physics.add.overlap(player, stars, collectStar, null, this);
   this.physics.add.overlap(player, inimigos, encostarInimigo, null, this)
   this.physics.add.overlap(player, saida, fimFase, null, this);
}

function update(){
    if(player.body.touching.down){ 
        nPulos = 0;
    }

    scoreText.x = player.x;

    if(player.y > 630){
        morrer();
    }

    if(Phaser.Input.Keyboard.JustDown(teclaEsc)){
        configuracoes();
    }

    if (cursors.left.isDown){
        andarEsquerda()
    }else if (cursors.right.isDown){
        andarDireita()
    }else{
        parar()
    }
    
    if(Phaser.Input.Keyboard.JustDown(teclaPulo)){
        if(nPulos == 0 && player.body.touching.down){
            pular()
        }
        if(nPulos == 1 && !player.body.touching.down){
            pular()
        }
    }
}

function andarEsquerda(){
    player.setVelocityX(-160)
    player.anims.play('left', true)
}

function andarDireita(){
    player.setVelocityX(160)
    player.anims.play('right', true)
}

function parar(){
    player.setVelocityX(0)
	player.anims.play('turn')
}

function pular(){
    nPulos++
    player.setVelocityY(-330)
}

// desativa estrela sobreposta pelo player
function collectStar (player, star){
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Pontos: ' + score + ' Vida: ' + vida);

    var inimigo = inimigos.create(1, 1, 'inimigo');
    inimigo.setBounce(1);
    inimigo.setCollideWorldBounds(true);
    inimigo.setVelocity(Phaser.Math.Between(-50, 500), 20);
}

function encostarInimigo(player, inimigo){
    vida -= 1;
    scoreText.setText('Pontos: ' + score + ' Vida: ' + vida);

    if(vida <= 0){
        morrer()
    }
}

function fimFase(player, saida){
    document.body.style.backgroundColor = '#090'
    document.getElementsByTagName('canvas')[0].style.display = 'none'
    document.getElementById('dvFimFase').style.display = ''
}

// ***************************************************

function iniciarJogo(){
    document.getElementById('dvMenu').style.display = 'none'
    document.body.style.backgroundColor = '#000'
    game = new Phaser.Game(config)
}

function sairJogo(){
    window.location.href = ''
}

function reiniciar(){
    window.location.href = ''
}

function morrer(){
    document.body.style.backgroundColor = '#900'
    document.getElementsByTagName('canvas')[0].style.display = 'none'
    document.getElementById('morte').style.display = ''
}

function configuracoes(){
    let canvas = document.getElementsByTagName('canvas')[0]
    if(canvas.style.display == ''){
        document.getElementById('dvMenu').style.display = 'none'
        document.getElementById('dvMenuConfiguracoes').style.display = ''
        canvas.style.display = 'none';
    }else{
        document.getElementById('dvMenuConfiguracoes').style.display = 'none'
        canvas.style.display = ''
    }
}