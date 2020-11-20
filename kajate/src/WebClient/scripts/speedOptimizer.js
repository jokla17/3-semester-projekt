let speedOptimizer = () => {
    let beerType = document.getElementById("slProductType").value;
    switch (beerType) {
        case "0":
            document.getElementById("tfMachineSpeed").value = 450;
            break;

        case "1":
            document.getElementById("tfMachineSpeed").value = 225;
            break;

        case "2":
            document.getElementById("tfMachineSpeed").value = 115;
            break;

        case "3":
            document.getElementById("tfMachineSpeed").value = 150;
            break;

        case "4":
            document.getElementById("tfMachineSpeed").value = 75;
            break;

        case "5":
            document.getElementById("tfMachineSpeed").value = 95;
            break;
    }
}
speedOptimizer();

document.getElementById("slProductType").addEventListener("click", () => {
    speedOptimizer();
});