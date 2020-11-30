let speedOptimizer = () => {
    let beerType = document.getElementById("slProductType").value;
    switch (beerType) {
        case "0":
            document.getElementById("tfMachineSpeed").value = 435;
            break;

        case "1":
            document.getElementById("tfMachineSpeed").value = 50;
            break;

        case "2":
            document.getElementById("tfMachineSpeed").value = 85;
            break;

        case "3":
            document.getElementById("tfMachineSpeed").value = 275;
            break;

        case "4":
            document.getElementById("tfMachineSpeed").value = 65;
            break;

        case "5":
            document.getElementById("tfMachineSpeed").value = 50;
            break;
    }
}
speedOptimizer();

document.getElementById("slProductType").addEventListener("click", () => {
    speedOptimizer();
});
