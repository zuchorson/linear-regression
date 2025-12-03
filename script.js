document.getElementById("fileInput").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        processCSV(text);
    };
    reader.readAsText(file);
});

function processCSV(text) {
    const output = document.getElementById("output");
    output.textContent = "";

    const lines = text.trim().split("\n");
    lines.shift();

    let x = [];
    let y = [];

    for (let line of lines) {
        let parts = line.split(";");

        let xi = parseFloat(parts[0].replace(",", "."));
        let yi = parseFloat(parts[1].replace(",", "."));

        x.push(xi);
        y.push(yi);
    }

    output.textContent += "Wczytane dane (x, y):\n";
    x.forEach((xi, i) => {
        output.textContent += `x${i+1} = ${xi.toFixed(16)}, y${i+1} = ${y[i].toFixed(16)}\n`;
    });

    const result = linearRegression(x, y);

    output.textContent += "\nWyniki regresji liniowej:\n";
    output.textContent += `Współczynnik kierunkowy: ${result.slope.toFixed(20)} ± ${result.slope_err.toFixed(20)}\n`;
    output.textContent += `Przecięcie z osią y: ${result.intercept.toFixed(20)} ± ${result.intercept_err.toFixed(20)}\n`;
}

function linearRegression(x, y) {
    const n = x.length;

    const sum = arr => arr.reduce((a, b) => a + b, 0);
    const mean = arr => sum(arr) / arr.length;

    const sum_x = sum(x);
    const sum_y = sum(y);
    const sum_xy = sum(x.map((xi, i) => xi * y[i]));
    const sum_x2 = sum(x.map(xi => xi * xi));

    const slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x);
    const intercept = (sum_y - slope * sum_x) / n;

    let residuals = y.map((yi, i) => yi - (slope * x[i] + intercept));
    let ss_res = sum(residuals.map(r => r * r));
    let ss_xx = sum(x.map(xi => (xi - mean(x)) ** 2));

    const slope_err = Math.sqrt((1 / (n - 2)) * ss_res / ss_xx);
    const intercept_err = slope_err * Math.sqrt(sum_x2 / n);

    return { slope, intercept, slope_err, intercept_err };
}
