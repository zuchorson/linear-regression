document.getElementById("fileInput").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => processCSV(e.target.result);
    reader.readAsText(file);
});

function processCSV(text) {
    const output = document.getElementById("output");
    const meanOutput = document.getElementById("meanOutput");
    
    output.textContent = "";
    meanOutput.textContent = "";

    const lines = text.trim().split("\n");
    const columns = lines.map(line => line.split(";").map(v => parseFloat(v.replace(",", "."))));

    const headerRemoved = columns.slice(1); // omijamy nagłówek

    // ==========================
    // REGRESJA z kolumny 1 i 2
    // ==========================

    const x = headerRemoved.map(row => row[0]);
    const y = headerRemoved.map(row => row[1]);

    output.textContent += "Wczytane dane (x, y):\n";
    x.forEach((xi, i) => {
        output.textContent += `x${i+1} = ${xi.toFixed(16)}, y${i+1} = ${y[i].toFixed(16)}\n`;
    });

    const result = linearRegression(x, y);

    output.textContent += "\nWyniki regresji liniowej:\n";
    output.textContent += `Współczynnik kierunkowy: ${result.slope.toFixed(20)} ± ${result.slope_err.toFixed(20)}\n`;
    output.textContent += `Przecięcie z osią y: ${result.intercept.toFixed(20)} ± ${result.intercept_err.toFixed(20)}\n`;

    // ==========================
    // ŚREDNIE DLA WSZYSTKICH KOLUMN
    // ==========================

    const colCount = columns[0].length;

    for (let c = 0; c < colCount; c++) {
        let colValues = headerRemoved
            .map(row => row[c])
            .filter(v => !isNaN(v));

        const n = colValues.length;
        const avg = colValues.reduce((a, b) => a + b, 0) / n;

        const variance =
            colValues.reduce((s, v) => s + (v - avg) ** 2, 0) / (n - 1);

        const std = Math.sqrt(variance);
        const std_err = std / Math.sqrt(n);

        meanOutput.textContent +=
            `Kolumna ${c + 1}:\n` +
            `Liczba danych: ${n}\n` +
            `Średnia: ${avg.toFixed(10)}\n` +
            `Odchylenie standardowe: ${std.toFixed(10)}\n` +
            `Błąd średniej: ${std_err.toFixed(10)}\n\n`;
    }
}


// =======================================
// Funkcja regresji — ta sama co wcześniej
// =======================================

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
