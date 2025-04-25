import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  MarkerType,
  useNodesState,
  useEdgesState,
} from 'react-flow-renderer';

export default function GraphVisualizer() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Add a new node
  const handleAdd = useCallback(() => {
    const inp = document.getElementById('nameInput');
    const name = inp.value.trim();
    if (!name || nodes.some(n => n.data.label === name)) return;

    setNodes(ns => [
      ...ns,
      {
        id: Date.now().toString(),
        data: { label: name },
        position: { x: Math.random() * 300, y: Math.random() * 300 },
      },
    ]);
    inp.value = '';
  }, [nodes, setNodes]);

  // Remove a node (and its edges)
  const handleRemove = useCallback(() => {
    const inp = document.getElementById('nameInput');
    const name = inp.value.trim();
    if (!name) return;

    setNodes(ns => ns.filter(n => n.data.label !== name));
    setEdges(es =>
      es.filter(e => {
        const from = nodes.find(n => n.id === e.source)?.data.label;
        const to = nodes.find(n => n.id === e.target)?.data.label;
        return from !== name && to !== name;
      })
    );
    inp.value = '';
  }, [nodes, setNodes, setEdges]);

  // Random: create a single cycle so each node has exactly one out + in
  const handleRandom = useCallback(() => {
    const ids = nodes.map(n => n.id);
    if (ids.length < 2) {
      setEdges([]);
      return;
    }

    // shuffle and link each to the next (cycle)
    const shuffled = [...ids].sort(() => Math.random() - 0.5);
    const newEdges = shuffled.map((src, i) => {
      const tgt = shuffled[(i + 1) % shuffled.length];
      return {
        id: `e${src}-${tgt}`,
        source: src,
        target: tgt,
        style: { strokeWidth: 3 },
        markerEnd: {
          type: MarkerType.Arrow,
          width: 20,
          height: 20,
          color: '#333',
        },
      };
    });

    setEdges(newEdges);
  }, [nodes, setEdges]);

  // Manual connect: refuse if src already has out OR tgt already has in
  const onConnectHandler = useCallback(
    conn => {
      const hasOutgoing = edges.some(e => e.source === conn.source);
      const hasIncoming = edges.some(e => e.target === conn.target);
      if (hasOutgoing || hasIncoming) return;

      setEdges(es =>
        addEdge(
          {
            ...conn,
            style: { strokeWidth: 3 },
            markerEnd: {
              type: MarkerType.Arrow,
              width: 20,
              height: 20,
              color: '#333',
            },
          },
          es
        )
      );
    },
    [edges, setEdges]
  );

  // wire up buttons
  useEffect(() => {
    document.getElementById('addBtn').onclick = handleAdd;
    document.getElementById('removeBtn').onclick = handleRemove;
    document.getElementById('randomBtn').onclick = handleRandom;
  }, [handleAdd, handleRemove, handleRandom]);

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 10,
          background: 'rgba(255,255,255,0.9)',
          padding: 8,
          border: '1px solid #ccc',
          borderRadius: 4,
        }}
      >
        <input id="nameInput" placeholder="Nama siswa" />
        <button id="addBtn">Tambah</button>
        <button id="removeBtn">Hapus</button>
        <button id="randomBtn">Randomin Graph-nya</button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnectHandler}
        nodesDraggable
        nodesConnectable
      >
        <Background gap={16} />
      </ReactFlow>
    </div>
  );
}