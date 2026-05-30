import { render, screen } from '@testing-library/react';
import AgendaNotAvailable from '../AgendaNotAvailable';

describe('AgendaNotAvailable component', () => {
  it('muestra el nombre del mes de apertura correcto', () => {
    // Junio es 5
    const openingDate = new Date(2026, 5, 1);
    render(<AgendaNotAvailable openingDate={openingDate} />);
    
    expect(screen.getByText(/Agenda no disponible hasta el 1 de Junio/i)).toBeInTheDocument();
  });

  it('renderiza el icono de candado', () => {
    const openingDate = new Date(2026, 6, 1);
    render(<AgendaNotAvailable openingDate={openingDate} />);
    
    expect(screen.getByText('🔒')).toBeInTheDocument();
  });
});
