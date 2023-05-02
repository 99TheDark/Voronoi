Promise.all([
    fetch("shader.vert"),
    fetch("shader.frag")
]).then(files => Promise.all(
    files.map(file => file.text())
).then(text => {
    main(text[0], text[1]);
}));

const positions = new Float32Array([
    -1, -1, 0, 0,
    1, -1, 1, 0,
    -1, 1, 0, 1,
    1, 1, 1, 1
]);

const indices = new Uint16Array([
    0, 1, 2,
    1, 2, 3
]);

const main = function(vertexSource, fragmentSource) {
    const canvas = document.getElementById("canvas");
    const gl = canvas.getContext("webgl2");
    const fs = Float32Array.BYTES_PER_ELEMENT;

    [canvas.width, canvas.height] = [innerWidth, innerHeight];
    gl.viewport(0, 0, canvas.width, canvas.height);

    const points = [];
    const colors = [];
    const size = 8;

    var generate = (i, j) => {
        points.push(Math.random() + i);
        points.push(Math.random() + j);

        colors.push(Math.random());
        colors.push(Math.random());
        colors.push(Math.random());
    };

    generate(-5, -5);
    for(let j = -1; j <= size; j++) for(let i = -1; i <= size; i++) generate(i, j);

    fragmentSource = fragmentSource.replaceAll("NUM_POINTS", (size + 1) * (size + 1) + 1);

    const vertex = gl.createShader(gl.VERTEX_SHADER);
    const fragment = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertex, vertexSource);
    gl.shaderSource(fragment, fragmentSource);

    gl.compileShader(vertex);
    gl.compileShader(fragment);

    if(!gl.getShaderParameter(vertex, gl.COMPILE_STATUS))
        throw "Error compiling vertex shader.\n\n" + gl.getShaderInfoLog(vertex);
    if(!gl.getShaderParameter(fragment, gl.COMPILE_STATUS))
        throw "Error compiling fragment shader.\n\n" + gl.getShaderInfoLog(fragment);

    const program = gl.createProgram();

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);

    gl.linkProgram(program);

    if(!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw "Error linking program.\n\n" + gl.getProgramInfoLog(program);

    gl.validateProgram(program);
    if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS))
        throw "Error validating program.\n\n" + gl.getProgramInfoLog(program);

    gl.useProgram(program);

    const position = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, position);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const index = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    const posAttribLocation = gl.getAttribLocation(program, "aPos");
    const uvAttribLocation = gl.getAttribLocation(program, "aUV");

    gl.vertexAttribPointer(
        posAttribLocation,
        2,
        gl.FLOAT,
        gl.FALSE,
        4 * fs,
        0
    );
    gl.vertexAttribPointer(
        uvAttribLocation,
        2,
        gl.FLOAT,
        gl.FALSE,
        4 * fs,
        2 * fs
    );

    gl.enableVertexAttribArray(posAttribLocation);
    gl.enableVertexAttribArray(uvAttribLocation);

    const mag = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);

    canvas.addEventListener("mousemove", e => {
        let rect = canvas.getBoundingClientRect();

        points[0] = (e.clientX - rect.left) / innerWidth * (canvas.width / mag) * size;
        points[1] = (1 - (e.clientY - rect.top) / innerHeight) * (canvas.height / mag) * size;
    });

    var draw = function() {
        const pointsUniformLocation = gl.getUniformLocation(program, "points");
        gl.uniform2fv(pointsUniformLocation, new Float32Array(points.map((point, i) => {
            if(i > 2 && i % 2 == 1) point += 0.15 * Math.sin(performance.now() / 800);
            return point;
        })));

        const colorsUniformLocation = gl.getUniformLocation(program, "colors");
        gl.uniform3fv(colorsUniformLocation, new Float32Array(colors));

        const aspectUniformLocation = gl.getUniformLocation(program, "aspect");
        gl.uniform2f(aspectUniformLocation, canvas.width / mag, canvas.height / mag);

        const zoomUniformLocation = gl.getUniformLocation(program, "zoom");
        gl.uniform1f(zoomUniformLocation, size);

        gl.clearColor(0.5, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.drawElements(
            gl.TRIANGLES,
            indices.length,
            gl.UNSIGNED_SHORT,
            0
        );

        requestAnimationFrame(draw);
    };

    draw();
};
