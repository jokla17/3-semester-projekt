let speedOptimizer = () => {
    let beerType = document.getElementById("slProductType").value;
    switch (beerType) {
        case "0":
            document.getElementById("tfMachineSpeed").value = 300;
            break;

        case "1":
            document.getElementById("tfMachineSpeed").value = 150;
            break;

        case "2":
            document.getElementById("tfMachineSpeed").value = 75;
            break;

        case "3":
            document.getElementById("tfMachineSpeed").value = 100;
            break;

        case "4":
            document.getElementById("tfMachineSpeed").value = 50;
            break;

        case "5":
            document.getElementById("tfMachineSpeed").value = 68;
            break;
    }
}
speedOptimizer();

document.getElementById("slProductType").addEventListener("click", () => {
    speedOptimizer();
});