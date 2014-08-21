This example demonstrates how to prevent D3’s [force layout](https://github.com/mbostock/d3/wiki/Force-Layout) from moving nodes that have been repositioned by the user. When the force layout’s [drag behavior](https://github.com/mbostock/d3/wiki/Drag-Behavior) dispatches a _dragstart_ event, the _fixed_ property of the dragged node is set to true. This prevents the force layout from subsequently changing the position of the node (due to forces). Double-click to release a node.

Internally, the force layout uses three bits to control whether a node is fixed. The first bit can be set externally, as in this example. The second and third bits are set on mouseover and mousedown, respectively, so that nodes are fixed temporarily during dragging. Although the second and third bits are automatically cleared when dragging ends, the first bit stays true in this example, and thus nodes remain fixed after dragging.

Also note that the force layout [resumes](https://github.com/mbostock/d3/wiki/Force-Layout#wiki-resume) automatically on _dragmove_. This ensures that other nodes in the graph respond naturally to the dragged node’s movement.