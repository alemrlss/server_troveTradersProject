/* eslint-disable prettier/prettier */
export const canUpdateState = (
  currentState: string,
  newState: string,
): boolean => {
  switch (currentState) {
    case 'disponible':
      return newState === 'acuerdo';
    case 'acuerdo':
      return newState === 'pago' || newState === 'disponible';
    case 'pago':
      return newState === 'recibo';
    case 'recibo':
      return newState === 'finalizado';
    case 'finalizado':
      return false; // No se permite actualizar el estado desde "finalizado"
    default:
      return false; // Estado no válido
  }
};
