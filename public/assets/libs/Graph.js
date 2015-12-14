/**
 * Graph class models a network between different vertex. Each edge has a direction and a value.
 * We will consider our graph as a dense network, so we will represent the edges in a 2x2 matrix
 * where the first dimension represents the vertex from the edge starts and the second dimension
 * represents the node where the edge ends.
 * We also allow connections between each vertex itself, so the matrix will have a NxN size where
 * N=total number of nodes.
 * Example of adjacency matrix for a graph of 4 nodes:
 *                       To
 *              From [[1,2,3,5],
 *              From  [1,2,3,5],
 *              From  [1,2,3,5],
 *              From  [1,2,3,5]]
 *
 * @constructor
 */
function Graph() {
    var vertexes = [],
        adjMatrix = [];

    /**
     * Method to add node to the graph.
     * @param vertex
     */
    this.addVertex = function (vertex) {
        //Add the node to the node list
        vertexes.push(vertex);

        //Add new line to the adjMatrix
        adjMatrix.push([]);

        //Init the array of edges with 0 values
        for(var i = 0; i < vertexes.length; i++){
            //Init the last member of each existing vertex
            adjMatrix[i][vertexes.length - 1] = 0;
            //Init each member of the last vertex array
            adjMatrix[vertexes.length - 1][i] = 0;
        }

        //Returns the index of the new element
        return vertexes.length - 1;
    };

    /**
     * Method to add edge between nodes in the adjacency matrix.
     * @param from
     * @param to
     * @param weight
     */
    this.addEdge = function (from, to, weight) {
        if(from >= 0 && from < vertexes.length && to >= 0 && to < vertexes.length && typeof weight == "number"){
            adjMatrix[from][to] = weight;
        }
    };

    /**
     * Method to get the list of nodes in the graph
     * @returns {Array}
     */
    this.getVertexes = function(){
        return vertexes;
    };

    /**
     * Method to get the adjacency matrix
     * @returns {Array}
     */
    this.getAdjMatrix = function(){
        return adjMatrix;
    };
}
