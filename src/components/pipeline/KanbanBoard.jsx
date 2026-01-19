import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Plus } from 'lucide-react';
import DealCard from './DealCard';

export default function KanbanBoard({ stages, deals, onDealMove, onDealClick, onStageEdit }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const dealId = draggableId.replace('deal-', '');
    const newStage = destination.droppableId.replace('stage-', '');

    onDealMove(dealId, newStage);
  };

  const getDealsByStage = (stageId) => {
    return deals.filter(d => d.stage === stageId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage, stageIndex) => {
          const stageDeals = getDealsByStage(stage.id || stage.name.toLowerCase());
          const stageValue = stageDeals.reduce((sum, d) => sum + (d.estimated_value || 0), 0);

          return (
            <div key={stage.id || stage.name} className="flex-shrink-0 w-80">
              <Card className="bg-[#1a0f2e] border-[#2d1e50] mb-3">
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={stage.color}>
                      {stage.label || stage.name}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{stageDeals.length}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onStageEdit?.(stage)}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {stageValue > 0 && (
                    <p className="text-xs text-gray-500">
                      ${stageValue.toLocaleString()}
                    </p>
                  )}
                </CardHeader>
              </Card>

              <Droppable droppableId={`stage-${stage.id || stage.name.toLowerCase()}`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-[#2d1e50]/30' : ''
                    }`}
                  >
                    {stageDeals.map((deal, index) => (
                      <Draggable
                        key={deal.id}
                        draggableId={`deal-${deal.id}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={snapshot.isDragging ? 'opacity-50' : ''}
                          >
                            <DealCard
                              deal={deal}
                              onClick={() => onDealClick(deal)}
                              compact
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {stageDeals.length === 0 && (
                      <div className="text-center py-8 text-gray-600 text-sm">
                        Drop deals here
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}

        {/* Add Stage Button */}
        <div className="flex-shrink-0 w-80">
          <Button
            variant="outline"
            className="w-full h-32 border-dashed border-[#2d1e50] hover:border-[#8b85f7]"
            onClick={() => onStageEdit?.(null)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Stage
          </Button>
        </div>
      </div>
    </DragDropContext>
  );
}