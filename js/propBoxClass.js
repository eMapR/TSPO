class PropBox {

  constructor(parentElement, itemString) {
    this.selectedColors = [];
    this.parentElement = parentElement || document.body;  // Default to document.body if no parentElement provided
    this.items = itemString.split(',').map(item => item.trim());  // Split string into array and trim whitespace
    this.colorMap = this.generateColorMap(this.items);
    this.initDOM();
    this.label;
    this.attachEventListeners();
    console.log(parentElement)
  }

  generateColorMap(items) {
    const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'cyan', 'magenta'];  // Define more colors as needed
    let colorMap = {};
    items.forEach((item, index) => {
      colorMap[item] = colors[index % colors.length];
    });
    return colorMap;
  }

  initDOM() {
    this.container = document.createElement('div');
    this.container.id = 'PropBox';

    let addButtonHtml = '';
    let popButtonHtml = '';

    this.items.forEach(item => {
      addButtonHtml += `<button id="add-${item}">${item}</button>`;
      popButtonHtml += `<button id="pop-${item}">${item}</button>`;
    });

    this.container.innerHTML = `
      <div style="display:flex">
        <p style="font-size:25px"><b>+</b></p>
        ${addButtonHtml}
        <p style="font-size:25px"><b>+</b></p>
      </div>
      <div style="display:flex">
        <canvas id="canvas" style="height:100px; width:100%"></canvas>
        <button id="resetButton">Reset</button>
      </div>
      <div style="display:flex">
        <p style="font-size:25px"><b>-</b></p>
        ${popButtonHtml}
        <p style="font-size:25px"><b>-</b></p>
      </div>
      <p id="num"></p>
    `;

    this.parentElement.appendChild(this.container);
  }

  attachEventListeners() {
    this.items.forEach(item => {
      this.container.querySelector(`#add-${item}`).addEventListener('click', () => this.changeColor(this.colorMap[item], item));
      this.container.querySelector(`#pop-${item}`).addEventListener('click', () => this.popColor(this.colorMap[item], item));
    });

    this.container.querySelector('#resetButton').addEventListener('click', () => this.resetColors());
  }

  changeColor(color) {
    var canvas = this.container.querySelector("#canvas");
    var context = canvas.getContext("2d");

    // Check if the color is already selected
    var index = this.selectedColors.indexOf(color);
    if (index !== -1) {
      this.selectedColors.unshift(color);
      this.selectedColors.sort();
    } else {
      this.selectedColors.unshift(color);
      this.selectedColors.sort();
    }

    this.updateCanvas();
    console.log(this.calculateProportions(this.selectedColors));
    this.displayProportions();
  }

  resetColors() {
    this.selectedColors = [];
    this.updateCanvas();
    this.displayProportions();
  }

  popColor(colorToRemove) {
    var index = this.selectedColors.indexOf(colorToRemove);

    if (index !== -1) {
      this.selectedColors.splice(index, 1);
      console.log(colorToRemove + " removed. Updated array: " + this.selectedColors);
      this.updateCanvas();
      this.displayProportions();
    } else {
      console.log(colorToRemove + " not found in the array.");
    }
  }

  updateCanvas() {
    var canvas = this.container.querySelector("#canvas");
    var context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);
    var rectWidth = canvas.width / this.selectedColors.length;

    this.selectedColors.forEach((color, index) => {
        var rectHeight = canvas.height;
        context.fillStyle = color;
        context.fillRect(index * rectWidth, 0, rectWidth, rectHeight);
    });
  }

  calculateProportions(array) {
    var frequency = {};

    array.forEach(value => {
        frequency[value] = (frequency[value] || 0) + 1 / array.length;
    });

    for (let key in frequency) {
        if (frequency.hasOwnProperty(key)) {
            frequency[key] *= 100;
            frequency[key] = Math.round(frequency[key]) + "%";
        }
    }
    var itemProportions = {};
    for (let item in this.colorMap) {
        if (this.colorMap.hasOwnProperty(item)) {
            const color = this.colorMap[item];
            if (frequency.hasOwnProperty(color)) {
                itemProportions[item] = frequency[color];
            }
        }
    }
    return itemProportions
  }

  displayProportions() {
    const numElement = this.container.querySelector("#num");
    this.label = JSON.stringify(this.calculateProportions(this.selectedColors));
    numElement.textContent = JSON.stringify(this.calculateProportions(this.selectedColors));
    this.appendLabel()
  }

  appendLabel(){

    // Get the id of the element
    const id = this.parentElement.id;
  
    // Use a regular expression to match numbers in the id string
    const match = id.match(/\d+/); // \d+ matches one or more digits

    // Check if there is a match and get the first group
    const number = match ? match[0] : null;

    $(`#selected`+number).text(this.label);

  }

}

