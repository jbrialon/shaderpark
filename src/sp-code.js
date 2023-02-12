const spCodeTexture = () => {
  return `
    let audio = input();
    let pointerDown = input();
    
    setMaxIterations(5);
    let s = getSpace();
    let r = getRayDirection();
    
    let n1 = noise(r * 4 +vec3(0, audio, vec3(0, audio, audio))*.5 );
    let n = noise(s + vec3(0, 0, audio+time*.1) + n1);
    
    metal(n*.5+.5);
    shine(n*.5+.5);
    
    color(vec3(0.2,  0.5, 1));
    displace(nsin(audio), cos(audio), nsin(audio));
    boxFrame(vec3(2), abs(n) * .1 + .04 );
    mixGeo(cos(audio));
    sphere(n * .5 + .8);
    `;
};

const spCodeSphere = () => {
  return `
    let audio = input();
    let pointerDown = input();
    
    setMaxIterations(50);

    let duration = (audio / 11) * TWO_PI;
    rotateY(-1*duration);
    metal(.8);
    sphere(.3);
    
    let hue = .5 + sin(audio) * .13;
    let col= hsv2rgb(vec3(hue, .9, .5));
    color(col);
    
    for(let i = 0.3; i > 0.1; i -= 0.05) {
      sphere(i);
      shell(0.008);
    }
    
    let pos = vec3(sin(duration), cos(duration), sin(duration));
    let n = noise(getSpace() * 3 + pos) * .1;
    expand(n);
    `;
};

const spCodeBlendShape = () => {
    return `
    let audio = input();
    let pointerDown = input();

    setMaxIterations(10);

    lightDirection(getRayDirection());
    metal(.4);
    shine(.7);
    
    let sCurve = shape((size, innerOffset) => {
      sphere(size);
      difference();
      let s = getSpace();
      displace(0.1, innerOffset, s.z);
      sphere(size-.03);
      expand(.00)
    })
    
    
    let s = getSpace();
    let col2 = vec3(0, .1, length(normal));

    let hue = .5 + sin(audio) * .13;
    let col= hsv2rgb(vec3(hue, .9, .5));
    color(col);

    color(col+normal*.1)
    rotateX((sin(time))*.04);
    rotateZ((sin(time))*.04);
    rotateY((cos(time))*.1);
    
    shape(() => {
      for(let i = 0; i < 3; i++) {
        blend(.1);
        // let rot = 4 * sin(time * .2) * .5 * audio;
        let rot = audio;
        rotateX(rot);
        rotateY(rot);
        rotateZ(rot);
        sCurve(1*(i/3)+.3, .2);
      }
      sphere(.15);
    })();
    mixGeo(nsin(audio)*.22+.9);
    sphere(.8)
    `;
}
export { spCodeTexture, spCodeSphere, spCodeBlendShape };
