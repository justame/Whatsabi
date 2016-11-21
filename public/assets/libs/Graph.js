/**
 * Graph class models a network between different nodes. Each edge has a direction and a value.
 * We will consider our graph as a dense network, so we will represent the edges in a 2x2 matrix
 * where the first dimension represents the vertex from the edge starts and the second dimension
 * represents the node where the edge ends.
 * We also allow connections between each vertex itself, so the matrix will have a NxN size where
 * N=total number of nodes.
 * Example of adjacency matrix for a graph of 4 nodes:
 *             To
 *        From [[1,2,3,5],
 *        From  [1,2,3,5],
 *        From  [1,2,3,5],
 *        From  [1,2,3,5]]
 *
 * @constructor
 */
function Graph() {
  var nodes = [];
  var edgesMatrix = [];

  this.addVertex = function (vertex) {
    nodes.push(vertex);
    edgesMatrix.push([]);

    for(var i = 0; i < nodes.length; i++){
      edgesMatrix[i][nodes.length - 1] = 0;
      edgesMatrix[nodes.length - 1][i] = 0;
    }

    return nodes.length - 1;
  };

  this.addEdge = function (from, to, weight) {
    if(from >= 0 && from < nodes.length && to >= 0 && to < nodes.length && typeof weight == "number"){
      edgesMatrix[from][to] = weight;
    }
  };

  this.getVertexes = function(){
    return nodes;
  };

  this.getAdjMatrix = function(){
    return edgesMatrix;
  };
}
