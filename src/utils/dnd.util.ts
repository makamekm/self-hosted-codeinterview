// a little function to help us with reordering the result
export const reorder = (list, startIndex, endIndex) => {
  const [removed] = list.splice(startIndex, 1);
  list.splice(endIndex, 0, removed);
  return list;
};

/**
 * Moves an item from one list to another list.
 */
export const move = (
  source,
  destination,
  droppableSource,
  droppableDestination
) => {
  const [removed] = source.splice(droppableSource.index, 1);

  destination.splice(droppableDestination.index, 0, removed);
};
