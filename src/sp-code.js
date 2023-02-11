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

export { spCodeTexture, spCodeSphere };
