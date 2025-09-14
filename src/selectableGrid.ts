import './GridStyle.css'

interface Coordinates{
  x: number;
  y: number; 
}

interface boundingBox{
  startX: number;
  startY: number;
  endX: number;
  endY: number; 
}

interface gridOptions{
  width: number;
  height: number;
  gridParentSelector: string;
  cellSize: number;
}

class gridManager{
  cellX: number;
  cellY: number;
  cellSize:number;
  grid: HTMLElement;
  gridParent: HTMLElement;
  gridHeight: number;
  gridWidth: number;
  private cells: Map<string, HTMLElement> = new Map();

  constructor(options: gridOptions){
    const {width, height, gridParentSelector, cellSize} = options;
    
    const containerParent = document.querySelector(gridParentSelector) as HTMLElement;
    if(!gridParentSelector){throw new Error('No grid parent found');}

    this.gridParent = containerParent;
    this.gridWidth = width;
    this.gridHeight = height;
    this.cellSize = cellSize;
    
    this.createGrid();
  }

  private createGrid(): void{
    this.grid = document.createElement('div');
    this.grid.className = 'grid';
    this.grid.style.height = `${this.gridHeight*this.cellSize}px`

    for (let i = 0; i < this.gridHeight; i++) {
      for (let j = 0; j < this.gridWidth; j++) {
        let cell = document.createElement('div')
        cell.className = 'grid-cell';
        cell.style.width = `${this.cellSize}px`;
        cell.dataset.x = j.toString();
        cell.dataset.y = i.toString();
        this.cells.set(`${cell.dataset.x},${cell.dataset.y}`, cell);
        this.grid.appendChild(cell);
      }
    }
    this.gridParent.appendChild(this.grid);
  }

  private getPixelBounds(gridX: number, gridY: number): boundingBox{
    const gridRect = this.grid.getBoundingClientRect();
    const cellSize = this.cellSize;

    return {
      startX: gridRect.left + (gridX*cellSize),
      startY: gridRect.top + (gridY*cellSize),
      endX: gridRect.left + (gridX*cellSize) + cellSize, //add cell size to get end position of the cell
      endY: gridRect.top + (gridY*cellSize) + cellSize
    };
  }

  private pixelToGrid(pixelX: number, pixelY: number): Coordinates{
    const gridRect = this.grid.getBoundingClientRect();
    const cellSize = this.cellSize;

    //Turn cursor coordinates to grid coordinates
    //(pixelX - gridRect.width) => How many pixel from the left edge are we into the grid
    //Ex. If we are 43px into the grid, dividing by cellSize will give 2.15, floor it and we can know we are on the 2nd column.
    const gridX = Math.floor((pixelX - gridRect.left)/cellSize);
    const gridY = Math.floor((pixelY - gridRect.top)/cellSize);

    return {
      x: gridX, 
      y: gridY
    }
  }

  private getCellsInBounds(bounds: boundingBox): Array<HTMLElement>{
    const selectedCells: HTMLElement[] = [];

    const startGrid = this.pixelToGrid(bounds.startX, bounds.startY);
    const endGrid = this.pixelToGrid(bounds.endX, bounds.endY);

    //Selection lower x/y grid coordiante
    //If selection starts outside (before) the grid's minimum boundary we start the selection at 0 x/y grid coordinate 
    const minX = Math.max(0, startGrid.x);
    const minY = Math.max(0, startGrid.y);

    //Given that gridWith is 10 but we are 0-indexing, the last cells have a x/y grid coordinate of gridWith - 1;
    const maxX = Math.max(this.gridWidth - 1, endGrid?.x ?? this.gridWidth - 1);
    const maxY = Math.max(this.gridHeight - 1, endGrid?.y ?? this.gridHeight -1)

    for (let y = minY; y < maxY; y++) {
      for(let x = minX; x < maxX; x++){
        const cellBounds = this.getPixelBounds(x, y);

        if(cellBounds.startX >= bounds.startX && cellBounds.endX <= bounds.endX && cellBounds.startY >= bounds.startY && cellBounds.endY <= bounds.endY){
          selectedCells.push(this.cells.get(`${x},${y}`) as HTMLElement)
        }
      }
    }
    return selectedCells;
  }


}

class GridCell{
  //Thinking...
}

function setupGrid(): void{

  const selectableGrid = new gridManager({
    width: 10,
    height: 10,
    gridParentSelector: ".selectable-grid-container",
    cellSize: 40
  })
}

document.addEventListener('DOMContentLoaded', setupGrid)