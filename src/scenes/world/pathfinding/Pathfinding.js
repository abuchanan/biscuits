define(['./Grid', './BinaryHeap'], function(Grid, BinaryHeap) {


    function PathfindingPlugin(scene) {
        var grid = Grid(scene.world);
        scene.findPath = findPath.bind(null, grid);
    }


    // TODO this wouldn't handle players with large bodies, i.e. greater than 1 x 1
    function findPath(grid, start, end, heuristic, returnClosest) {

        heuristic = heuristic || manhattan;
        returnClosest = returnClosest || true;
        var nodes = {};

        function getNode(pos) {
            var key = pos.x + '-' + pos.y;
            var node = nodes[key];
            var gridNode = grid.get(pos.x, pos.y);

            if (!node) {
                var node = {
                    x: pos.x,
                    y: pos.y,
                    f: 0,
                    g: 0,
                    h: heuristic(pos, end),
                    visited: false,
                    closed: typeof gridNode === 'undefined' || gridNode > 0,
                    parent: null,
                };
                nodes[key] = node;
            }

            return node;
        }

        function getScore(node) {
            return node.f;
        }

        var heap = new BinaryHeap(getScore);
        var startNode = getNode(start);
        var closest = startNode;
        heap.push(startNode);


        while (heap.size() > 0) {
            var current = heap.pop();

            if (current.x == end.x && current.y == end.y) {
                return pathTo(current);
            }

            current.closed = true;

            var neighbors = getNeighbors(current);

            for (var i = 0, ii = neighbors.length; i < ii; i++) {
                var neighbor = getNode(neighbors[i]);

                if (neighbor.closed) {
                    continue;
                }
                
                // TODO var gScore = current.g + getWeight(neighbor, current)
                // TODO I'm not using node weights yet, so the "g" score is always 0
                var gScore = 0;
                var beenVisited = neighbor.visited;

                if (!beenVisited || gScore < neighbor.g) {
                    // Found an optimal (so far) path to this node.
                    // Take score for node to see how good it is.
                    neighbor.visited = true;
                    neighbor.parent = current;
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;

                    // If the neighbor is closer than the current closest,
                    // or if it's equally close but has a cheaper path than
                    // the current closest node, then it becomes the closest node
                    if (neighbor.h < closest.h
                        || (neighbor.h === closest.h
                            && neighbor.g < closest.g)) {

                        closest = neighbor;
                    }

                    if (!beenVisited) {
                        // Pushing to heap will put it in proper place
                        // based on the 'f' value.
                        heap.push(neighbor);
                    }
                    else {
                        // Already seen the node, but since it has been
                        // rescored we need to reorder it in the heap
                        heap.rescoreElement(neighbor);
                    }
                }
            }
        }

        if (returnClosest) {
            return pathTo(closest);
        }

        return [];
    }

    function manhattan(pos0, pos1) {
        var d1 = Math.abs(pos1.x - pos0.x);
        var d2 = Math.abs(pos1.y - pos0.y);
        return d1 + d2;
    }

    function getNeighbors(pos) {
        return [
            {x: pos.x, y: pos.y - 1},
            {x: pos.x, y: pos.y + 1},
            {x: pos.x - 1, y: pos.y},
            {x: pos.x + 1, y: pos.y}
        ];
    }

    function pathTo(node){
        var curr = node,
            path = [];
        while(curr.parent) {
            path.push(curr);
            curr = curr.parent;
        }
        return path.reverse();
    }

    return PathfindingPlugin;
});
