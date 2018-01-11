class Chart {
  constructor(id, data) {
    this.canvas = document.getElementById(id);
    // Consts
    this.values = {
      // max values for Y axis (e.g from -20 to 20)
      max: 20,
      // walk step for Y axis (e.g -20 -18 -16 ... 0 2 4 ... 16 18 20)
      step: 2,
      lineWidth: 15
    };
    this.time = {
      lineWidth: 15,
      // margin for Year text
      offset: 5
    }

    this.data = data;//.splice(0, 10);
    this.dLength = this.data.length;
    this.context = this.canvas.getContext('2d');
    this.width = this.canvas.width - 80;
    this.height = this.canvas.height - 90;
    this.x0 = this.y0 = 30;
    this.update();
  }

  /**
   * Draws X & Y axis on chart
   */
  drawAxis() {
    this.context.beginPath();
    // Y axis
    this.context.moveTo(this.x0, this.y0);
    this.context.lineTo(this.x0, this.height + this.y0);
    // X axis
    this.context.lineTo(this.width + this.x0, this.height + this.y0);
    this.context.strokeStyle = '#000';
  }

  /**
   * Draws vectors for X & Y axis
   */
  drawAxisVectors() {
    this.oneStepLeft = this.height / this.values.max;
    this.oneStepBottom = this.width / this.dLength;
    // Draw Y values on Y axis
    for (let i = 0; i <= this.values.max; i += this.values.step) {
      const bottom = this.height - this.oneStepLeft * i + this.x0;
      this.context.moveTo(this.y0, bottom);
      this.context.lineTo(this.y0 - this.values.lineWidth, bottom);
      this.context.fillText(i - this.values.max / 2, this.y0 - this.values.lineWidth, bottom - 3);
    }
    // Draw X values on X axis
    for (let i = 0; i < this.dLength; i++) {
      const left = i * this.oneStepBottom + this.y0;
      this.context.moveTo(left, this.height + this.y0);
      this.context.lineTo(left, this.height + this.y0 + this.time.lineWidth);
      this.context.fillText(this.data[i].year, left + this.time.offset, this.height + this.y0 + this.time.lineWidth);
    }
    this.context.lineWidth = 2;
  }

  /**
   * Draws chart lines for each year & value
   */
  drawLines() {
    this.context.beginPath();
    for (let i = 0; i < this.dLength; i++) {
      const {value, year} = this.data[i];
      const finalValue = value / yearDays(year);
      const x = this.x0 + (i * this.oneStepBottom);
      const y = this.y0 + (this.height - (finalValue + this.values.max / 2) * this.oneStepLeft);

      if (0 === i)
        this.context.moveTo(x, y);
      else
        this.context.lineTo(x, y);
      this.context.arc(x, y, 2, 0, 2 * Math.PI, false);
      // values
      this.context.fillText(Number(finalValue).toFixed(2), x + 5, y - 5);

    }
    this.context.strokeStyle = '#89d448';
    this.context.lineWidth = 1;
  }

  /**
   * Closes paths and stops drawing
   */
  stopDraw() {
    this.context.stroke();
    this.context.closePath();
  }

  /**
   * Clear canvas
   */
  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Updates canvas, render chart
   * @param {array} data chart values
   */
  update(data) {
    console.time('Updating chart.');
    if (data) {
      this.data = data;
      this.dLength = data.length;
    }
    this.clear();
    this.drawAxis();
    this.drawAxisVectors();
    this.stopDraw();
    this.drawLines();
    this.stopDraw();
    console.timeEnd('Updating chart.');
  }
}