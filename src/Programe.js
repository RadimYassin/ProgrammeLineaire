import React, { useState } from "react";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function ProgLineaire() {
  const [variables, setVariables] = useState("");
  const [coefficientsObjectif, setcoefficientsObjectif] = useState([]);
  const [constraints, setConstraints] = useState("");
  const [coefficients, setCoefficients] = useState([]);
  const [conditions, setConditions] = useState([]);

  const [matrix, setMatrix] = useState([]);

  const [Z, setZ] = useState("");

  const [equations, seteQuations] = useState([]);

  const AddObject = () => {
    const vars = document.getElementById("variableCount").value;
    setVariables(vars);
    const coefficientsObjectifArr = new Array(parseInt(vars)).fill("");
    setcoefficientsObjectif(coefficientsObjectifArr);
  };

  const AddSysteme = () => {
    seteQuations([]);
    const ctr = document.getElementById("constraintCount").value;
    setConstraints(ctr);
    const coeffs = new Array(parseInt(ctr))
      .fill()
      .map(() => new Array(parseInt(variables)).fill(""));
    const conds = new Array(parseInt(ctr)).fill("");
    setCoefficients(coeffs);
    setConditions(conds);
  };

  const desplayObjectif = () => {
    let objectiveStr = "Max";
    let objective = `${objectiveStr}(z) = `;
    for (let i = 0; i < parseInt(variables); i++) {
      objective += coefficientsObjectif[i] + "X" + (i + 1);
      if (i !== parseInt(variables) - 1) objective += " + ";
    }
    setZ(objective);
  };

  const DesplaySysteme = () => {
    console.log("\nSystème d'équations linéaires:");
    for (let i = 0; i < parseInt(constraints); i++) {
      let equation = "";
      for (let j = 0; j < parseInt(variables); j++) {
        equation += coefficients[i][j] + "X" + (j + 1);
        if (j !== parseInt(variables) - 1) equation += " + ";
      }
      equation += ` <= ${conditions[i]}`;

      seteQuations((prev) => [...prev, equation]);
    }
  };

  const initialiserTableauSimplexe = () => {
    let tableau = new Array(parseInt(constraints) + 1)
      .fill()
      .map(() =>
        new Array(parseInt(variables) + parseInt(constraints) + 1).fill(0)
      );

    for (let j = 0; j < parseInt(variables); j++) {
      tableau[parseInt(constraints)][j] = -parseFloat(coefficientsObjectif[j]);
    }
    for (let i = 0; i < parseInt(constraints); i++) {
      for (let j = 0; j < parseInt(variables); j++) {
        tableau[i][j] = parseFloat(coefficients[i][j]);
      }
    }

    for (let i = 0; i < parseInt(constraints); i++) {
      tableau[i][parseInt(variables) + i] = 1;
      tableau[i][parseInt(variables) + parseInt(constraints)] = parseFloat(
        conditions[i]
      );
    }

    return tableau;
  };

  const chooseVariables = (tableau) => {
    let variableEntree = 0;

    let maxCoeff = tableau[parseInt(constraints)][0];

    for (let j = 1; j < parseInt(variables); j++) {
      if (tableau[parseInt(constraints)][j] < maxCoeff) {
        maxCoeff = tableau[parseInt(constraints)][j];
        variableEntree = j;
      }
    }

    let variableSortie = -1;
    let minRatio = Infinity;

    for (let i = 0; i < parseInt(constraints); i++) {
      if (tableau[i][variableEntree] > 0) {
        let ratio =
          tableau[i][parseInt(variables) + parseInt(constraints)] /
          tableau[i][variableEntree];
        if (ratio < minRatio) {
          minRatio = ratio;
          variableSortie = i;
        }
      }
    }

    return [variableEntree, variableSortie];
  };

  const UpdateTableau = (tableau, variables) => {
    let pivotRow = variables[1];
    let pivotCol = variables[0];

    let pivot = tableau[pivotRow][pivotCol];
    for (let j = 0; j < tableau[pivotRow].length; j++) {
      tableau[pivotRow][j] /= pivot;
    }

    for (let i = 0; i < tableau.length; i++) {
      if (i !== pivotRow) {
        let ratio = tableau[i][pivotCol];
        for (let j = 0; j < tableau[i].length; j++) {
          tableau[i][j] -= ratio * tableau[pivotRow][j];
        }
      }
    }
  };

  const testerOptimalite = (tableau) => {
    for (let j = 0; j < parseInt(variables); j++) {
      if (tableau[parseInt(constraints)][j] < 0) {
        return false;
      }
    }
    return true;
  };

  const DesplayTableau = (tableau) => {
    let newMatrix = [];

    // Header row
    let headerRow = ["Z"];
    for (let i = 0; i < parseInt(variables); i++) {
      headerRow.push(`X${i + 1}`);
    }
    for (let i = 0; i < parseInt(constraints); i++) {
      headerRow.push(`e${i + 1}`);
    }
    newMatrix.push(headerRow);

    // Last row (coefficientsObjectif row)
    let lastRow = ["1"];
    for (let j = 0; j < tableau[tableau.length - 1].length; j++) {
      lastRow.push(tableau[tableau.length - 1][j].toFixed(2));
    }
    newMatrix.push(lastRow);

    // Other rows
    for (let i = 0; i < tableau.length - 1; i++) {
      let row = ["0"];
      for (let j = 0; j < tableau[i].length; j++) {
        row.push(tableau[i][j].toFixed(2));
      }
      newMatrix.push(row);
    }

    setMatrix((e) => [...e, newMatrix]);
  };

  const SolveSimplexe = () => {
    setMatrix([]);

    let tableau = initialiserTableauSimplexe();
    DesplayTableau(tableau);

    while (!testerOptimalite(tableau)) {
      let variables = chooseVariables(tableau);
      UpdateTableau(tableau, variables);
      DesplayTableau(tableau);
    }
  };

  const renderMatrixTable = () => {
    const result = [];
    console.log(matrix[matrix.length - 1]);
    matrix[matrix.length - 1].map((m, i) => {
      console.log(m[m.length - 1]);
      if (m[m.length - 1]) {
        result.push(m[m.length - 1]);
      }
    });

    return (
      <div className=" ">
        {matrix.map((table, tableIndex) => (
          <div>
            <h1 className="m-5">
              {tableIndex == 0 ? "table initale" : "Itération : " + tableIndex}
            </h1>
            <table
              className=" mt-4 w-full text-sm text-left rtl:text-right "
              border={1}
              key={tableIndex}
            >
              <tbody>
                {table.map((row, index) => (
                  <tr
                    class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    key={index}
                  >
                    {row.map((cell, cellIndex) => (
                      <td className="w-4 p-4" key={cellIndex}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <div className="flex gap-4 mt-5">
          {result.map((r, i) => {
            if (i != 0) {
              if (i == 1) {
                return <p>z = {r}</p>;
              }
            }
          })}
          {result.map((r, i) => {
            if (i != 0 && i != 1) {
              return (
                <p>
                  x{i - 1} = {r}
                </p>
              );
            }
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Input fields for variables and constraints */}

      <div className="w-full flex justify-center ">
        <div className="bg-white w-4/5 shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4 w-1/3 m-auto">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="variableCount"
            >
              Nombre de variables:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
              id="variableCount"
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
            />
          </div>
          <div className="mb-4 mb-4 w-1/3 m-auto">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="constraintCount"
            >
              Nombre de contraintes:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
              id="constraintCount"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
            />
          </div>
          <button
            disabled={!constraints.length > 0}
            class="mx-3 bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 border border-cyan-700 rounded disabled:bg-cyan-200"
            onClick={AddSysteme}
          >
            Saisir système
          </button>

          <button
            disabled={!variables.length > 0}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded disabled:bg-blue-200"
            onClick={AddObject}
          >
            Saisir objectif
          </button>
        </div>
      </div>

      <div className="w-full flex justify-center ">
        <div className="bg-green-200  w-4/5 shadow-md rounded px-8 pt-6 pb-8 mb-4">
          {/* Input fields for coefficientsObjectif */}
          {variables !== "" && parseInt(variables) > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <span> Z = </span>
              {coefficientsObjectif.map((c, index) => (
                <div key={index}>
                  <span style={{ display: index == 0 && "none" }}> +</span>
                  <span>X{index + 1} * </span>
                  <input
                    type="number"
                    className=" m-2 shadow appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={c}
                    onChange={(e) => {
                      const newcoefficientsObjectif = [...coefficientsObjectif];
                      newcoefficientsObjectif[index] = e.target.value;
                      setcoefficientsObjectif(newcoefficientsObjectif);
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          <button
            disabled={!constraints.length > 0}
            class="bg-green-500 mt-5 hover:bg-green-700 text-white font-bold py-2 px-4 border border-green-700 rounded disabled:bg-green-200"
            onClick={desplayObjectif}
          >
            Afficher objectif
          </button>
        </div>
      </div>

      <div className="w-full flex justify-center ">
        <div className="bg-rose-200  w-4/5 shadow-md rounded px-8 pt-6 pb-8 mb-4">
          {/* Input fields for coefficients and conditions */}
          {constraints !== "" && parseInt(constraints) > 0 && (
            <div>
              <h3 className="text-lg">
                Saisir les coefficients et conditions:
              </h3>
              {coefficients.map((coeffs, index) => (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  key={index}
                >
                  <h4 style={{ marginRight: "20px" }}>
                    Contrainte {index + 1}
                  </h4>
                  {coeffs.map((coeff, idx) => (
                    <div key={idx}>
                      <span style={{ display: idx == 0 && "none" }}> +</span>
                      <span>X{idx + 1} * </span>
                      <input
                        type="number"
                        className="m-2 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={coeff}
                        onChange={(e) => {
                          const newCoefficients = [...coefficients];
                          newCoefficients[index][idx] = e.target.value;
                          setCoefficients(newCoefficients);
                        }}
                      />
                    </div>
                  ))}
                  <span>{"<="}</span>
                  <input
                    type="number"
                    className=" m-2 shadow appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={conditions[index]}
                    onChange={(e) => {
                      const newConditions = [...conditions];
                      newConditions[index] = e.target.value;
                      setConditions(newConditions);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          <button
            disabled={!coefficients.length}
            class="mt-4 bg-rose-500 hover:bg-rose-700 text-white font-bold py-2 px-4 border border-rose-700 rounded disabled:bg-rose-200"
            onClick={DesplaySysteme}
          >
            Afficher système
          </button>
        </div>
      </div>
      {/* Button to resolve simplex */}

      <div className="w-full flex justify-center ">
        <div className="bg-white-200  w-4/5 shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <button
            onClick={SolveSimplexe}
            className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
          >
            Run{" "}
          </button>
        </div>
      </div>

      <div>
        {/* Matrix table */}
        <div id="content-to-print" className="w-full flex justify-center  ">
          {matrix.length > 0 && (
            <div className="bg-white-200  w-4/5 shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <div className="text-start m-4">OBJECTIF :{Z}</div>
              <h1 className=" m-4 text-start">les constraints :</h1>
              <ul className="m-4 max-w-md space-y-1 text-gray-500 list-inside ">
                {equations.map((e, index) => {
                  return (
                    <li className="flex items-center" key={index}>
                      <svg
                        class="w-3.5 h-3.5 me-2 text-green-500  flex-shrink-0"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                      </svg>
                      {e}
                    </li>
                  );
                })}
              </ul>
              {renderMatrixTable()}
            </div>
          )}
        </div>
        <button className=" mb-5 bg-red-500 hover:bg-rose-700 text-white font-bold py-2 px-4 border border-rose-700 rounded "  onClick={printDivToPDF}>Print to PDF</button>
      </div>
    </div>
  );
}

export default ProgLineaire;

function printDivToPDF() {
  const doc = new jsPDF();

  const contentDiv = document.getElementById("content-to-print");

  html2canvas(contentDiv, { scrollY: -window.scrollY })
    .then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      // Adjust canvas height to ensure all content is captured
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      doc.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      return doc;
    })
    .then((doc) => {
      // Save the PDF
      doc.save("content.pdf");
    })
    .catch((error) => {
      console.error("Error generating PDF:", error);
    });
}
