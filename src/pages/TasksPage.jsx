import { useMemo, useState  } from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors,
 } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy  } from '@dnd-kit/sortable';
import { CSS  } from '@dnd-kit/utilities';
import { PageHeader  } from '../components/common/PageHeader';
import { Card  } from '../components/ui/Card';
import { Badge  } from '../components/ui/Badge';
import { Avatar  } from '../components/ui/Avatar';
import { db  } from '../data/db';
import { cn  } from '../lib/utils';
const columns = [
  { id: 'todo', label: 'To Do', color: 'border-t-muted' },
  { id: 'in-progress', label: 'In Progress', color: 'border-t-primary' },
  { id: 'review', label: 'Review', color: 'border-t-warning' },
  { id: 'done', label: 'Done', color: 'border-t-success' },
];

const priorityVariant = {
  urgent: 'danger', high: 'warning', medium: 'primary', low: 'muted',
};

function KanbanCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-lg border border-border bg-card p-3 shadow-soft transition-shadow hover:shadow-glow"
    >
      <p className="text-sm font-medium text-foreground">{task.title}</p>
      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
      <div className="mt-3 flex items-center justify-between">
        <Badge variant={priorityVariant[task.priority]} className="capitalize">{task.priority}</Badge>
        {task.assignee && <Avatar name={`${task.assignee.firstName} ${task.assignee.lastName}`} size="xs" />}
      </div>
    </div>
  );
}

export function TasksPage() {
  const [board, setBoard] = useState(() => {
    const tasks = db.tasks.map((t) => ({ ...t, assignee: db.employees.find((e) => e.id === t.assigneeId) }));
    return {
      'todo': tasks.filter((t) => t.status === 'todo'),
      'in-progress': tasks.filter((t) => t.status === 'in-progress'),
      'review': tasks.filter((t) => t.status === 'review'),
      'done': tasks.filter((t) => t.status === 'done'),
    };
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (e) => {
    const { active, over } = e;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;

    for (const col of columns) {
      const items = board[col.id];
      const activeIndex = items.findIndex((t) => t.id === activeId);
      if (activeIndex !== -1) {
        const overCol = columns.find((c) => c.id === overId);
        const overIndexInCol = overCol ? board[overCol.id].findIndex((t) => t.id === overId) : -1;

        if (overCol && overCol.id !== col.id) {
          // moving to another column
          setBoard((prev) => {
            const from = [...prev[col.id]];
            const [moved] = from.splice(activeIndex, 1);
            const to = [...prev[overCol.id]];
            const insertAt = overIndexInCol !== -1 ? overIndexInCol : to.length;
            to.splice(insertAt, 0, { ...moved, status: overCol.id });
            return { ...prev, [col.id]: from, [overCol.id]: to };
          });
          return;
        }
        // same column reorder
        setBoard((prev) => {
          const items = [...prev[col.id]];
          const overIndex = items.findIndex((t) => t.id === overId);
          if (overIndex === -1) return prev;
          return { ...prev, [col.id]: arrayMove(items, activeIndex, overIndex) };
        });
        return;
      }
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Tasks" description="Kanban board for task management" />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {columns.map((col) => (
            <div key={col.id}>
              <Card className={cn('border-t-2', col.color)}>
                <div className="flex items-center justify-between p-3">
                  <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
                  <Badge variant="muted">{board[col.id].length}</Badge>
                </div>
                <SortableContext items={board[col.id].map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 px-3 pb-3">
                    {board[col.id].map((task) => <KanbanCard key={task.id} task={task} />)}
                    {board[col.id].length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">No tasks</p>}
                  </div>
                </SortableContext>
              </Card>
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
}
