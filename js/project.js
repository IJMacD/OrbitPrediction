$(function() {

  "use strict";

  GE.DEBUG = true;

  var GEC = GE.Comp,

      /* Constants */
      GAME_WIDTH = 1280,
      GAME_HEIGHT = 720,

      /* Bootstrap */
      canvas = $('#surface')[0],
      context = canvas.getContext("2d"),

      game = new GE.Game({
        canvas: canvas,
        width: GAME_WIDTH,
        height: GAME_HEIGHT
      }),

      worldSystem = game.getDefaultWorld(),
      cameraSystem = game.getDefaultCamera(),
      renderSystem = game.getDefaultRenderer(),
      inputSystem = game.getDefaultInput(),

      sun = new GE.GameObject(),
      ball = new GE.GameObject(),
      arrow = new GE.GameObject();

  sun.addComponent(function (parent, delta) {
    renderSystem.push(function (context) {
      context.translate(parent.position[0], parent.position[1]);

      context.fillStyle = "#ff0";
      context.beginPath();
      context.arc(0, 0, 100, 0, Math.PI * 2, false);
      context.fill();
    });
  });

  arrow.addComponent(function (parent, delta) {
    // Bad gl-matrix: !!!
    // parent.rotation = vec3.angle(ball.position, parent.position);
    var dx = ball.position[0] - parent.position[0],
        dy = ball.position[1] - parent.position[1];
    parent.rotation = -Math.atan2(dx, dy);
  });
  arrow.addComponent(function (parent, delta) {
    renderSystem.push(function (context) {
      context.translate(parent.position[0], parent.position[1]);
      context.rotate(parent.rotation);

      context.strokeStyle = "#000";
      context.lineWidth = 7;
      context.beginPath();
      context.moveTo(0, -25);
      context.lineTo(0, 15);
      context.lineTo(-5, 15);
      context.lineTo(0, 25);
      context.lineTo(5, 15);
      context.lineTo(0,15);
      context.stroke();
    });
  });

  ball.setPosition(0, -200);
  ball.setVelocity(0.06666);
  ball.bounds = [-20,-20,20,20];
  // ball.addComponent(new GEC.GravityComponent());
  ball.addComponent(function (parent, delta) {
    if(inputSystem.lastClick[0]){
      var scale = inputSystem.lastClick.which == 1 ? 0.01 : -0.01;
      vec3.scaleAndAdd(parent.impulse, parent.impulse, parent.velocity, scale);
    }
  });
  ball.addComponent(new GEC.PointGravityComponent(sun));

  ball.addComponent(new GEC.DebugDrawDataComponent(renderSystem));

  // Numerical Orbit Predictor
  ball.addComponent(function (parent, delta) {
    var p = vec3.clone(parent.position),
        v = vec3.clone(parent.velocity),
        a = vec3.clone(parent.acceleration),
        _ = vec3.create();
    renderSystem.push(function (context) {
      context.strokeStyle = "#33f";
      context.beginPath();
      context.moveTo(p[0], p[1]);
      for(var i=0;i<10000;i++){
        // Only account for point gravity from sun
        vec3.subtract(_, sun.position, p);
        var scale = sun.mass/vec3.squaredLength(_);
        vec3.normalize(_, _);
        // Apply delta a, v, and p
        vec3.scale(a, _, scale);
        vec3.scaleAndAdd(v, v, a, delta);
        vec3.scaleAndAdd(p, p, v, delta);
        context.lineTo(p[0], p[1]);
      }
      context.stroke();
    });
  });
  ball.addComponent(function (parent, delta) {
    renderSystem.push(function (context) {
      context.translate(parent.position[0], parent.position[1]);

      context.fillStyle = "#08f";
      context.beginPath();
      context.arc(0, 0, 20, 0, Math.PI * 2, false);
      context.fill();
    });
  });

  ball.addComponent(new GEC.PhysicsComponent());
  ball.addComponent(new GEC.MoveComponent());
  // ball.addComponent(new GEC.WorldBounceComponent(worldSystem));
  ball.addComponent(new GEC.DebugDrawPathComponent(renderSystem));

  cameraSystem.setPosition(0, 0);
  cameraSystem.setScale(0.5);

  game.root.addObject(sun);
  game.root.addObject(ball);
  game.root.addObject(arrow);

  game.root.addObject(inputSystem);
  game.root.addObject(worldSystem);
  game.root.addObject(cameraSystem);
  game.root.addObject(renderSystem);

  game.timeScale = 1;

  game.start();

});
