const { runStatusModule } = require('./runStatusModule');

runStatusModule({
  uneId: "LDN3A",
  testedPath: "./data/Tested_Segment_Report_RAW_Fix.xlsx",
  untestedPath: "./data/Untested_Segment_Report_RAW_Fix.xlsx",
  planPath: "./data/Testplan.xlsx",
  useExe: false, // <- sätt true om du vill testa exe-filen
})
  .then((result) => {
    console.log("Riktigt resultat från skript:");
    console.dir(result, { depth: null });
  })
  .catch((err) => {
    console.error("Fel uppstod:");
    console.error(err);
  });
