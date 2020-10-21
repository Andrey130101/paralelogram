function Event() {
    this._listeners = [];
}

Event.prototype = {
    on : function (listener) {
        this._listeners.push(listener);
    },
    emit : function (args) {
        var index;
        for (index = 0; index < this._listeners.length; index += 1) {
            this._listeners[index]( args);
        }
    }
};

function View(model) {
    this._model = model;


    //события представлени
    this.mousedown1 = new Event();
    this.mouseup1 = new Event();
    this.mousemove = new Event();
    this.resetClick = new Event();
    this.aboutClick = new Event();


    let aboutButton = document.querySelector(".about button");
    let closeButton = document.querySelector(".close");

    let modalWindow = document.getElementsByClassName("modalWindow")[0];
    let modalData = document.getElementsByClassName("modalData")[0];

    aboutButton.addEventListener("click", (e) => {
      modalWindow.style.display = "block";
    });
    closeButton.addEventListener("click", (e) => {
       modalWindow.style.display = "none";
    });

    window.addEventListener("click",  (e) => {
      if (e.target === modalWindow) {
        modalWindow.style.display = "none";
      }
    });

    let reset = document.querySelector(".reset");
    let canvas = document.getElementById("myCanvas");

    let modal = (e) => {
      let a = Math.abs(e.pageX - canvas.offsetLeft);
      let b = Math.abs(e.pageY - canvas.offsetTop);

      this.mousemove.emit({e: e, x : a, y: b });
    };
    reset.addEventListener("click", (e) => {
      this.resetClick.emit();
    });
    canvas.addEventListener("mouseup",  (e) => {
        canvas.addEventListener("mousemove", modal);
        let a = Math.abs(e.pageX - canvas.offsetLeft);
        let b = Math.abs(e.pageY - canvas.offsetTop);

        this.mouseup1.emit({e: e, x : a, y: b });
    });
    canvas.addEventListener("mousedown",  (e) => {
      canvas.removeEventListener("mousemove", modal);
      let a = Math.abs(e.pageX - canvas.offsetLeft);
      let b = Math.abs(e.pageY - canvas.offsetTop);

      this.mousedown1.emit({e: e, x : a, y: b });
    });

    canvas.addEventListener("mousemove", modal);


    //события модели
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = "black";
    this._model.reset.on(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    this._model.pointAdded.on((args) => {
       ctx.clearRect(0, 0, canvas.width, canvas.height);
       drawFirstsPoints(args.points);
    });

    this._model.imgPointAdded.on((args) => {
       ctx.clearRect(0, 0, canvas.width, canvas.height);
       drawFirstsPoints(args.points);
       drawImaginePoints(args.imgPoints);
    });

    this._model.finallFigure.on((args) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPoints(args.points);
      drawCircle(args.circle.center, args.circle.radius)
      drawLines(args.points);
    });


    this._model.pointRejected.on((args) => {
      console.log(args.mess)
    });

    this._model.pointOver.on((data) => {
      showData(data);
    });
    this._model.figureOver.on((data) => {
      showData(data);
    });
    this._model.noneOver.on(() => {
      showNone();
    });

    //локальные функции
    let showData = (data) => {
      let modalContent = document.querySelector("div.modalData-content");
      let table = document.querySelector("div.modalData-content table");

      if (table !== null) {
         modalContent.removeChild(table);
      }
      let elem = document.createElement("table");



      for (let i = 0; i < data.data.name.length; i++) {
        let caption = document.createElement("caption");
        caption.textContent = data.data.name[i];
        elem.appendChild(caption);

        for (var key in data.data.data[i]) {
             let tr = document.createElement("tr");
             let td1 = document.createElement("td");
             let td2 = document.createElement("td");

             td1.textContent = key;
             td2.textContent = Math.round(data.data.data[i][key], -1);

             tr.appendChild(td1);
             tr.appendChild(td2);
             elem.appendChild(tr);
        }
      }
      modalContent.appendChild(elem);
      modalData.style.display = "inline-block";

      if (data.data.name.length === 2) {
        console.log(1);
        modalData.style.top = String(data.data.mouse[1] - 50) + "px";
        modalData.style.left =  String(data.data.mouse[0] - 50) + "px";
      } else {
        console.log(data.data.mouse[1], data.data.mouse[0]);
        modalData.style.top = String(data.data.mouse[1]) + "px";
        modalData.style.left =  String(data.data.mouse[0]) + "px";
      }
    };
    let showNone = () => {
      let modalContent = document.querySelector("div.modalData-content");
      let table = document.querySelector("div.modalData-content table");

      if (table !== null) {
         modalContent.removeChild(table);
      }
      modalData.style.display = "none";
    };

    let drawPoints = (points) => {

    for (let point of points) {
      ctx.beginPath();
      ctx.arc(point[0], point[1], 10, 0, Math.PI*2, false);
      ctx.stroke();
      ctx.closePath();
      ctx.stroke();
    }
    };
    let drawFirstsPoints = (points) => {
      for (let point of points) {
        ctx.beginPath();
        ctx.arc(point[0], point[1], 5, 0, Math.PI*2, false);
        ctx.closePath();
        ctx.stroke();
      }
    };

    let drawImaginePoints = (imgPoints) => {
      for (let point of imgPoints) {
        ctx.beginPath();
        ctx.arc(point[0], point[1], 10, 0, Math.PI*2, false);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
      }
    };

    let drawCircle = (center, radius) => {
      ctx.beginPath();
      ctx.arc(center[0], center[1], radius, 0, Math.PI*2, false);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(center[0], center[1], 10, 0, Math.PI*2, false);
      ctx.fillStyle = "black";
      ctx.fill();
      ctx.closePath();
    };

    let drawLines = (points) => {
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.lineWidth = 1;
      for (let i = 0; i < points.length; i++) {
        ctx.moveTo(points[i][0],points[i][1]);
        for (let j = i; j < points.length; ++j) {
          ctx.moveTo(points[i][0], points[i][1]);
          ctx.lineTo(points[j][0], points[j][1])
        }
      }
      ctx.closePath();
      ctx.stroke();
    };
}

function Model() {
  this.reset = new Event();

  this.pointAdded = new Event();
  this.imgPointAdded = new Event();
  this.finallFigure = new Event();


  this.pointRejected = new Event();

  this.pointOver = new Event();
  this.figureOver = new Event();
  this.noneOver = new Event();

    //viewdata
    //state
    let state = {
      points: [],
      imgPoints: [],
      circle : {
        center: [],
        radius: 0
      }
    };
    this.getState = () => {
      return state;
    };

    let state2 = {
      name: [],
      data: []
    };

    let localState = {
      firstPair: [],
      secondPair: [],
      sides:[],
      diagonals: [],
      degree: 0
    };
    //mode
    let mode = {
      type:0
    }


    this.main = (action) => {
      if (action.type === "reset") {
        reset();
        this.reset.emit();
      }

      switch (mode.type) {
        case 0:
          if (action.type === "click") {
            addPoint(action.point[0], action.point[1]);
            this.pointAdded.emit({points:state.points});
            mode.type = 1;
          }
          break;
        case 1:
          if (action.type === "click") {
            addPoint(action.point[0], action.point[1]);
            if (state.points.length === 3) {
              addImgPoints();
              mode.type = 2;
              this.imgPointAdded.emit({points: state.points, imgPoints: state.imgPoints});
            }
            else {
              this.pointAdded.emit({points:state.points});
            }
          } else if (action.type === "pointHold") {
            changePoint(action.selected , action.point[0], action.point[1]);
            this.pointAdded.emit({points:state.points});
          }
          break;
        case 2:
          if (action.type === "click") {
            this.pointRejected.emit({mess: "no"});
          } else if (action.type === "pointHold") {
            changePoint(action.selected , action.point[0], action.point[1]);
            addImgPoints();

            this.imgPointAdded.emit({points: state.points, imgPoints: state.imgPoints});
          } else if (action.type === "imgPointClick") {
             addPoint(state.imgPoints[action.selectedImg][0], state.imgPoints[action.selectedImg][1]);
             addOppPoints();
             addLengths();
             addDegree();
             addCircle();

             state.imgPoints = [];
             state.selectedImg = -1;

             mode.type = 3;
             this.finallFigure.emit({points: state.points, circle: state.circle});
          }
          break;
        case 3:
          if (action.type === "click") {
            this.pointRejected.emit({mess: "no"});
          } else if (action.type === "pointHold") {
            changeOppPoints(action.selected , action.point[0], action.point[1]);
            addLengths();
            addDegree();
            addCircle();
            this.finallFigure.emit({points: state.points, circle: state.circle});
          } else if (action.type === "centerHold") {
            changeAllPoints(action.point[0], action.point[1]);
            addOppPoints();
            //this.finallFigure.emit({points: localState, circle: state.circle});
            this.finallFigure.emit({points: state.points, circle: state.circle});
          }
          break;
      }
    };

    this.main2 = (action) => {
      state2 = {
        name: [],
        data: [],
        mouse: []
      };
      switch (action.type) {
        case "none":
          this.noneOver.emit({});
          break;
        case "point":
          state2.name.push("Point");
          state2.data.push({x: action.data[0], y: action.data[1]});
          state2.mouse = action.mouse;
          this.pointOver.emit({data: state2});
          break;

        case "imgPoint":
          state2.name.push("Possible point");
          state2.data.push({x: action.data[0], y: action.data[1]});
          state2.mouse = action.mouse;
          this.pointOver.emit({data: state2});
          break;

        case "center":
          state2.name.push("Center");
          state2.data.push({x: action.data[0], y: action.data[1]});
          state2.mouse = action.mouse;
          this.pointOver.emit({data: state2});
          break;

        case "parallelogram":
          state2.name.push("Parallelogram");
          state2.data.push({square: state.circle.radius*state.circle.radius*Math.PI,
          perimeter: (2*localState.sides[0] + 2*localState.sides[1])});
          state2.mouse = action.mouse;
          this.figureOver.emit({data: state2});
          break;
        case "circle":
          state2.name.push("Circle");
          state2.data.push({square: state.circle.radius*state.circle.radius*Math.PI,
          perimeter: 2*Math.PI*state.circle.radius});
          state2.mouse = action.mouse;
          this.figureOver.emit({data: state2});
          break;
        case "both":
         state2.name.push("Parallelogram");
         state2.data.push({square: state.circle.radius*state.circle.radius*Math.PI,
         perimeter: (2*localState.sides[0] + 2*localState.sides[1])});

         state2.name.push("Circle");
         state2.data.push({square: state.circle.radius*state.circle.radius*Math.PI,
         perimeter: 2*Math.PI*state.circle.radius});
         state2.mouse = action.mouse;
         this.figureOver.emit({data: state2});
          break;
      }
    }

    let reset = () => {
      state.points = [];
      state.imgPoints = [];
      state.selected = -1;
      state.selectedImg = -1;
      state.circle.center = [];
      state.circle.radius = 0;

      localState.firstPair = [];
      localState.secondPair = [];
      localState.sides = [];
      localState.diagonals = [];

      mode.type = 0;
    }

    let addPoint = (x, y) => {
      let point = [];
      point.push(x);
      point.push(y);
      state.points.push(point);
    };


    let changePoint = (i, x, y) => {
      let near = 0;
      if ((x > 5) && (y > 5)) {
        for (let j = 0; j < state.points.length; j++) {
          if (i === j) continue;
          let subX = Math.abs(state.points[j][0] - x);
          let subY = Math.abs(state.points[j][1] - y);
          if (Math.sqrt(subX*subX + subY*subY) < 22) {
            near = 1;
          }
        }
        if (near === 0) {
          state.points[i][0] = x;
          state.points[i][1] = y;
        }
      }
    };

    let addCircle = () => {
        let S = localState.sides[0]*localState.sides[1]*Math.sin(localState.degree*Math.PI/180);
        state.circle.radius = Math.sqrt(S/Math.PI);

        let A1 = localState.firstPair[0];
        let A2 = localState.firstPair[1];

        let A3 = localState.secondPair[0];
        let A4 = localState.secondPair[1];

        let k1 = (A2[1] - A1[1])/(A2[0] - A1[0]);
        let b1 = (A1[1] - A1[0]*(A2[1] - A1[1])/(A2[0] - A1[0]));

        let k2 = (A4[1] - A3[1])/(A4[0] - A3[0]);
        let b2 = (A3[1] - A3[0]*(A4[1] - A3[1])/(A4[0] - A3[0]));;
        let x = (b2 - b1) / (k1 - k2);
        let y = k1*x + b1;

        state.circle.center[0] = x;
        state.circle.center[1] = y;
    };

    let changeOppPoints = (i, x, y) => {
      let index = 0;
      let p = [];
      let a = [];
      let dx = 0;
      let dy = 0;
      let pair = "";

      for (let point of localState.firstPair) {
        if ((point[0] === state.points[i][0]) && (point[1] === state.points[i][1])) {
          p = localState.firstPair;
          pair = "first";
          break;
        }
      }
      for (let point of localState.secondPair) {
        if ((point[0] === state.points[i][0]) && (point[1] === state.points[i][1])) {
          p = localState.secondPair;
            pair = "second";
          break;
        }
      }
      for (let point of p) {
        if ((point[0] !== state.points[i][0]) && (point[1] !== state.points[i][1])) {
          a = point;
        }
      }
      for (let i = 0; i < state.points.length; i++) {
        if (state.points[i][0] === a[0] && state.points[i][1] === a[1]) {
            index = i;
            break;
        }
      }
      let near = 0;
        for (let j = 0; j < state.points.length; j++) {
          if (i === j) continue;
          let subX = Math.abs(state.points[j][0] - x);
          let subY = Math.abs(state.points[j][1] - y);
          if (Math.sqrt(subX*subX + subY*subY) < 22) {
            near = 1;
          }
        }
        if (near === 0) {
          if ((state.points[i][0] - x) >= 0 && (state.points[i][1] - y) >= 0) {
            dx = Math.abs(state.points[i][0] - x);
            dy = Math.abs(state.points[i][1] - y);
          } else if ((state.points[i][0] - x) <= 0 && (state.points[i][1] - y) >= 0) {
            dx = -Math.abs(state.points[i][0] - x);
            dy = Math.abs(state.points[i][1] - y);
          } else if ((state.points[i][0] - x) >= 0 && (state.points[i][1] - y) <= 0) {
            dx = Math.abs(state.points[i][0] - x);
            dy = -Math.abs(state.points[i][1] - y);
          } else {
            dx = -Math.abs(state.points[i][0] - x);
            dy = -Math.abs(state.points[i][1] - y);
          }
          let a = state.points[index][0];
          let b = state.points[index][1];
          a += dx;
          b += dy;
            if (((x > 11) && (y > 11)) && ((a > 11) && (b > 11))) {
              state.points[i][0] += -dx;
              state.points[i][1] += -dy;

              state.points[index][0] += dx;
              state.points[index][1] += dy;

              if (pair === "first") {
                  localState.firstPair[0][0] = state.points[i][0];
                  localState.firstPair[0][1] = state.points[i][1];

                  localState.firstPair[1][0] = state.points[index][0];
                  localState.firstPair[1][1] = state.points[index][1];

              } else if (pair === "second") {
                localState.secondPair[0][0] = state.points[i][0];
                localState.secondPair[0][1] = state.points[i][1];

                localState.secondPair[1][0] = state.points[index][0];
                localState.secondPair[1][1] = state.points[index][1];
              }
            }

        }
    };
    let changeAllPoints = (x, y) => {
        let dx = 0;
        let dy = 0;
        if ((state.circle.center[0] - x) >= 0 && (state.circle.center[1] - y) >= 0) {
          dx = -Math.abs(state.circle.center[0] - x);
          dy = -Math.abs(state.circle.center[1] - y);
        } else if ((state.circle.center[0] - x) <= 0 && (state.circle.center[1] - y) >= 0) {
          dx = Math.abs(state.circle.center[0] - x);
          dy = -Math.abs(state.circle.center[1] - y);
        } else if ((state.circle.center[0] - x) >= 0 && (state.circle.center[1] - y) <= 0) {
          dx = -Math.abs(state.circle.center[0] - x);
          dy = Math.abs(state.circle.center[1] - y);
        } else {
          dx = Math.abs(state.circle.center[0] - x);
          dy = Math.abs(state.circle.center[1] - y);
        }
        let near = 0;
        let index = 0;
        for (let j = 0; j < state.points.length; j++) {

          if ((state.points[j][0] > 11) && (state.points[j][1] > 11)) {
            near = 0;
          } else {
            near = 1;
            index = j;
            break;
          }
        }
        if (near == 0) {
          state.circle.center[0] = x;
          state.circle.center[1] = y;

          for (let i = 0; i < state.points.length; i++) {
            state.points[i][0] += dx;
            state.points[i][1] += dy;
          }
          for (let i = 0; i < localState.firstPair.length; i++) {
            localState.firstPair[i][0] += dx;
            localState.firstPair[i][1] += dy;
            localState.secondPair[i][0] += dx;
            localState.secondPair[i][1] += dy;
          }
        } else {
          let a = state.points[index][0];
          let b = state.points[index][1];
          a += dx;
          b += dy;
          if ((a > 11) && (b > 11)) {
            state.circle.center[0] = x;
            state.circle.center[1] = y;

            for (let i = 0; i < state.points.length; i++) {
              state.points[i][0] += dx;
              state.points[i][1] += dy;
            }
            for (let i = 0; i < localState.firstPair.length; i++) {
              localState.firstPair[i][0] += dx;
              localState.firstPair[i][1] += dy;
              localState.secondPair[i][0] += dx;
              localState.secondPair[i][1] += dy;
            }
          }
        }
    };

    let addOppPoints = () => {
      localState.firstPair = [];
      localState.secondPair = [];

      let y = 0;
      let rectangle = 0;

      let Points = JSON.stringify(state.points);
      let points = {};

      points = JSON.parse(Points);


      for (let i =  points.length - 1; i > 0; i--) {
        for (let j = 0; j < i; j++) {
            if (points[j][0] > points[j+1][0]) {
              if (points[j][0] === points[j+1][0]) {
                y = 1;
                break;
              } else {
                let swap = points[j];
                points[j] = points[j+1];
                points[j+1] = swap;
              }
            }
        }
      }


      if (y === 1) {
        points = JSON.parse(Points);
        for (let i =  points.length - 1; i > 0; i--) {
          for (let j = 0; j < i; j++) {
              if (points[j][1] > points[j+1][1]) {
                if (points[j][1] === points[j+1][1]) {
                  rectangle = 1;
                  break;
                } else {
                  let swap = points[j];
                  points[j] = points[j+1];
                  points[j+1] = swap;
                }
              }
          }
        }
      }

      for (let i = 0; i < points.length; i++) {
        let pair = [];
        pair.push(points[i][0]);
        pair.push(points[i][1]);
        if (i === 0 || i === 3) {
          localState.firstPair.push(pair)
        } else {
          localState.secondPair.push(pair)
        }
      }
    /*else {
        points = JSON.parse(Points);

        let subX = Math.abs(points[0][0] - points[1][0]);
        let subY = Math.abs(points[0][1] - points[1][1]);

        let index = 0;
        let indexes = [];

        for (let i = 2; i < state.points.length; i++) {
          subX = Math.abs(points[0][0] - points[i][0]);
          subY = Math.abs(points[0][1] - points[i][1]);

          if (Math.sqrt(subX*subX + subY*subY) > max) {
            max = Math.sqrt(subX*subX + subY*subY);
            index = i;
          } else {
            indexes.push(i);
          }
        }

        localState.firstPair.push(state.points[0]);
        localState.firstPair.push(state.points[index]);

        localState.secondPair.push(state.points[indexes[0]]);
        localState.secondPair.push(state.points[indexes[1]]);


        subX = Math.abs(localState.firstPair[0][0] - localState.firstPair[1][0]);
        subY = Math.abs(localState.firstPair[0][1] - localState.firstPair[1][1]);
        l1_1 = Math.sqrt(subX*subX + subY*subY);
        l1_2 = l1_1

        localState.diagonals.push(l1_1);
        localState.diagonals.push(l1_2);

        subX = Math.abs(localState.firstPair[0][0] - localState.seconfPair[0][0]);
        subX = Math.abs(localState.firstPair[0][1] - localState.seconfPair[0][1]);
        l2 = Math.sqrt(subX*subX + subY*subY);

        subX = Math.abs(localState.firstPair[0][0] - localState.seconfPair[1][0]);
        subX = Math.abs(localState.firstPair[0][0] - localState.seconfPair[1][1]);
        l3 = Math.sqrt(subX*subX + subY*subY);

        localState.sides.push(l2);
        localState.sides.push(l3);

      }*/
    };
    let addLengths = () => {
      localState.sides = [];
      localState.diagonals = [];

      let points = [];
      points[0] = localState.secondPair[0];
      points[1] = localState.secondPair[1];
      points[2] = localState.firstPair[0];
      points[3] = localState.firstPair[1];

      let l1_1, l1_2 = 0;
      let l2, l3 = 0;

      let subX = Math.abs(points[0][0] - points[3][0]);
      let subY = Math.abs(points[0][1] - points[3][1]);
      l1_1 = Math.sqrt(subX*subX + subY*subY);

      subX = Math.abs(points[1][0] - points[2][0]);
      subY = Math.abs(points[1][1] - points[2][1]);
      l1_2 = Math.sqrt(subX*subX + subY*subY);

      localState.diagonals.push(l1_1);
      localState.diagonals.push(l1_2);

      subX = Math.abs(points[0][0] - points[1][0])
      subX = Math.abs(points[0][1] - points[1][1])
      l2 = Math.sqrt(subX*subX + subY*subY);

      subX = Math.abs(points[0][0] - points[2][0])
      subX = Math.abs(points[0][1] - points[2][1])
      l3 = Math.sqrt(subX*subX + subY*subY);

      localState.sides.push(l2);
      localState.sides.push(l3);
    };

    let addDegree = () => {
      localState.degree = 0;
      let l1_1 = localState.diagonals[0];
      let l1_2 = localState.diagonals[1];
      let l2 = localState.sides[0];
      let l3 = localState.sides[1];

      if (l1_1 >= l1_2) {
        localState.degree = Math.acos((-l1_2*l1_2 + l2*l2 + l3*l3)/(2*l2*l3))*180/Math.PI;
      } else {
        localState.degree = Math.acos((-l1_1*l1_1 + l2*l2 + l3*l3)/(2*l2*l3))*180/Math.PI;
      }
    };
    let addImgPoints = () => {
      //add 2 ocations
      state.imgPoints = [];
      for (let mainPoint of state.points) {
        let sidePoints = []
        for (let point of state.points) {
          if (mainPoint[0] == point[0] && mainPoint[1] == point[1]) continue;
          let sidePoint = [];
          sidePoint.push(point[0]);
          sidePoint.push(point[1]);

          sidePoints.push(sidePoint);
        }
        //build vectors
        let vectors = [];

        for (let sidePoint of sidePoints) {
          let a = [];
          if (sidePoint[0] > mainPoint[0] && sidePoint[1] > mainPoint[1]) {
            a.push(Math.abs(sidePoint[0] - mainPoint[0]));
            a.push(-Math.abs(sidePoint[1] - mainPoint[1]));
          } else if(sidePoint[0] > mainPoint[0] && sidePoint[1] < mainPoint[1]) {
            a.push(Math.abs(sidePoint[0] - mainPoint[0]));
            a.push(Math.abs(sidePoint[1] - mainPoint[1]));
          } else if (sidePoint[0] < mainPoint[0] && sidePoint[1] > mainPoint[1]) {
            a.push(-Math.abs(sidePoint[0] - mainPoint[0]));
            a.push(-Math.abs(sidePoint[1] - mainPoint[1]));
          } else {
            a.push(-Math.abs(sidePoint[0] - mainPoint[0]));
            a.push(Math.abs(sidePoint[1] - mainPoint[1]));
          }
          vectors.push(a);
        }
        //build new vector
        let c = [];
        c[0] = vectors[0][0] + vectors[1][0];
        c[1] = vectors[0][1] + vectors[1][1];
        //build new imgPoint
        let imgPoint = []
        if (c[0] > 0 && c[1] > 0) {
          imgPoint.push(mainPoint[0] + Math.abs(c[0]));
          imgPoint.push(mainPoint[1] - Math.abs(c[1]));
        } else if(c[0] > 0 && c[1] < 0) {
          imgPoint.push(mainPoint[0] + Math.abs(c[0]));
          imgPoint.push(mainPoint[1] + Math.abs(c[1]));
        } else if(c[0] < 0 && c[1] > 0) {
          imgPoint.push(mainPoint[0] - Math.abs(c[0]));
          imgPoint.push(mainPoint[1] - Math.abs(c[1]));
        } else {
          imgPoint.push(mainPoint[0] - Math.abs(c[0]));
          imgPoint.push(mainPoint[1] + Math.abs(c[1]));
        }
        if ((imgPoint[0] > 11) && (imgPoint[1] > 10)) {
        state.imgPoints.push(imgPoint);
        }
      }
    };

};


function Controller(model, view) {
    this._model = model;
    this._view = view;

    let action = {
      type: "",
      point: [],
      selected: -1,
      selectedImg: -1
    };
    let action2 = {
      type: "",
      data: [],
      mouse:[]
    };

    this._view.resetClick.on(() => {
       action.type = "reset";
       this._model.main(action);
    });

    ///////////
    this._view.mousemove.on((args) => {


      let state = this._model.getState();
      let none = 1;

      if (state.imgPoints.length !== 0) {
        for (let point of state.imgPoints) {
          let subX = Math.abs(point[0] - args.x);
          let subY = Math.abs(point[1] - args.y);

          if(Math.sqrt(subX*subX + subY*subY) < 11){
             action2.type = "imgPoint";
             action2.data[0] = point[0];
             action2.data[1] = point[1];
             action2.mouse[0] = args.x;
             action2.mouse[1] = args.y;
             none = 0;
             this._model.main2(action2);
             break;
          }
        }
      }
      if (none === 1) {
        if (state.points.length !== 0) {
          for (let point of state.points) {
            let subX = Math.abs(point[0] - args.x);
            let subY = Math.abs(point[1] - args.y);

            if(Math.sqrt(subX*subX + subY*subY) < 11){
              action2.type = "point";
              action2.data[0] = point[0];
              action2.data[1] = point[1];
              action2.mouse[0] = args.x;
              action2.mouse[1] = args.y;
              none = 0;
              this._model.main2(action2);
              break;
            }
          }
        }
      }

      if (none === 1) {
        if (state.points.length === 4) {
          let subX = Math.abs(state.circle.center[0] - args.x);
          let subY = Math.abs(state.circle.center[1] - args.y);
          if (Math.sqrt(subX*subX + subY*subY) < 11) {
            action2.type = "center";
            action2.data[0] = state.circle.center[0];
            action2.data[1] = state.circle.center[1];
            action2.mouse[0] = args.x;
            action2.mouse[1] = args.y;
            none = 0;
            console.log(Math.sqrt(subX*subX + subY*subY) < 11);
            this._model.main2(action2);
          }
        }
      }

      if (none === 1) {

        if (state.points.length === 4) {
           let points= state.points;

           let Inside = 1;

           let max = 0;

           let mainIndexes = [];
           let sideIndexes = [];

           let subX = 0;
           let subY = 0;

           for (let i = 0; i < 2; i++) {
             for (let j = 0; j < 4; j++) {
               if (i === j) {
                 continue;
               }
               subX = Math.abs(state.points[i][0] - state.points[j][0]);
               subY = Math.abs(state.points[i][1] - state.points[j][1]);

               if(Math.sqrt(subX*subX + subY*subY) > max){
                 mainIndexes[0] = i;
                 mainIndexes[1] = j;
                 max = Math.sqrt(subX*subX + subY*subY);
               }
             }
           }
           for (let i = 0; i < 4; i++) {
             if((i !== mainIndexes[0]) && (i !== mainIndexes[1])) {
                 sideIndexes.push(i);
             }
           }

           for (let i = 0; i < 2; i++) {
               let C = [ [(state.points[sideIndexes[0]][0] - state.points[mainIndexes[i]][0]), (state.points[sideIndexes[1]][0] - state.points[mainIndexes[i]][0])] , [(state.points[sideIndexes[0]][1] - state.points[mainIndexes[i]][1]), (state.points[sideIndexes[1]][1] - state.points[mainIndexes[i]][1])]];
               let B1 = [[args.x], [args.y]];
               let B2 = [[state.points[mainIndexes[i]][0]], [state.points[mainIndexes[i]][1]]];

               let Cinv = InverseMatrix(C);

               let A1 = MultiplyMatrix(Cinv, B1);
               let A2 = MultiplyMatrix(Cinv, B2);
               A2 = ChangeSign(A2);

               let A = SumMatrix(A1, A2);

               if ((A[0][0] < 0) || (A[1][0] < 0)) {
                Inside = 0;
               }
             }

              subX = Math.abs(state.circle.center[0] - args.x);
              subY = Math.abs(state.circle.center[1] - args.y);
              if (Inside === 1) {

                if((Math.sqrt(subX*subX + subY*subY) < state.circle.radius) && (Math.sqrt(subX*subX + subY*subY) > 11)){
                  action2.type = "both";
                  action2.mouse[0] = args.x;
                  action2.mouse[1] = args.y;
                  none = 0;
                  this._model.main2(action2);
                } else {
                  action2.type = "parallelogram";
                  action2.mouse[0] = args.x;
                  action2.mouse[1] = args.y;
                  none = 0;
                  this._model.main2(action2);
                }
              } else {
                if((Math.sqrt(subX*subX + subY*subY) < state.circle.radius) && (Math.sqrt(subX*subX + subY*subY) > 11)){
                  action2.type = "circle";
                  action2.mouse[0] = args.x;
                  action2.mouse[1] = args.y;
                  none = 0;
                  this._model.main2(action2);
                }
              }
           }

      }
      if (none === 1) {
        action2.type = "none"
        this._model.main2(action2);
      }
    });

    this._view.mouseup1.on((args) => {
      args.e.target.removeEventListener("mousemove", detectPoint);

    });

    this._view.mousedown1.on((args) => {
      action2.type = "none"
      this._model.main2(action2);

      let state = this._model.getState();
      let findImg = 0;
      let findCenter = 0;

      if (state.imgPoints.length !== 0) {
        let i = 0;
        for (let point of state.imgPoints) {
          let subX = Math.abs(point[0] - args.x);
          let subY = Math.abs(point[1] - args.y);

          if(Math.sqrt(subX*subX + subY*subY) < 22){
            action.type = "imgPointClick";
            action.point[0] = args.x;
            action.point[1] = args.y;
            action.selectedImg = i;
            findImg = 1;
            break;
          }
          i++;
        }
      }
      if (findImg === 0) {
        if (state.circle.center.length !== 0) {
          let subX = Math.abs(state.circle.center[0] - args.x);
          let subY = Math.abs(state.circle.center[1] - args.y);

          if(Math.sqrt(subX*subX + subY*subY) < 22){
            findCenter = 1;
            console.log(1);
            action.type = "centerHold";
            action.point[0] = args.x;
            action.point[1] = args.y;
            args.e.target.addEventListener("mousemove", detectPoint);
          }
      }
    }
    if (findCenter === 0 && findImg === 0) {
      if (state.points.length !== 0) {
        let i = 0;
        for (let point of state.points) {
          let subX = Math.abs(point[0] - args.x);
          let subY = Math.abs(point[1] - args.y);

          if(Math.sqrt(subX*subX + subY*subY) < 22){
            action.type = "pointHold";
            action.selected = i;
            args.e.target.addEventListener("mousemove", detectPoint);

            break;
          } else {
            action.type = "click";
            action.point[0] = args.x;
            action.point[1] = args.y;
            action.selected = -1;
          }
          i++;
        }
      } else {
        action.type = "click";
        action.point[0] = args.x;
        action.point[1] = args.y;
        action.selected = -1;
      }
    }
      this._model.main(action);
    });
    let detectPoint = (e) => {
      action.point[0] = Math.abs(e.pageX - e.target.offsetLeft);
      action.point[1] = Math.abs(e.pageY - e.target.offsetTop);
      this._model.main(action);
    }
}



(function() {
  let model = new Model();
  let view = new View(model);
  let controller = new Controller(model, view);
}());
