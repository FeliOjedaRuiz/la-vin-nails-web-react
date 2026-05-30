import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WeekNavigator from '../../components/week-navigator/WeekNavigator';

describe('WeekNavigator', () => {
  const mockWeek = {
    firstDay: '2024-05-01',
    lastDay: '2024-05-07'
  };

  it('renderiza las fechas de la semana correctamente', () => {
    render(<WeekNavigator currentWeek={mockWeek} onPrev={() => {}} onNext={() => {}} />);
    
    // El formato en el componente es "d 'de' MMMM"
    // 1 de mayo al 7 de mayo (o similar dependiendo de la configuración de locale)
    expect(screen.getByText(/1 de mayo/i)).toBeInTheDocument();
    expect(screen.getByText(/7 de mayo/i)).toBeInTheDocument();
  });

  it('llama a onPrev cuando se hace click en el botón anterior', () => {
    const onPrev = jest.fn();
    render(<WeekNavigator currentWeek={mockWeek} onPrev={onPrev} onNext={() => {}} />);
    
    const prevButton = screen.getAllByRole('button')[0];
    fireEvent.click(prevButton);
    
    expect(onPrev).toHaveBeenCalled();
  });

  it('llama a onNext cuando se hace click en el botón siguiente', () => {
    const onNext = jest.fn();
    render(<WeekNavigator currentWeek={mockWeek} onPrev={() => {}} onNext={onNext} />);
    
    const nextButton = screen.getAllByRole('button')[1];
    fireEvent.click(nextButton);
    
    expect(onNext).toHaveBeenCalled();
  });

  it('deshabilita el botón anterior si disablePrev es true', () => {
    const onPrev = jest.fn();
    render(<WeekNavigator currentWeek={mockWeek} onPrev={onPrev} onNext={() => {}} disablePrev={true} />);
    
    const prevButton = screen.getAllByRole('button')[0];
    
    expect(prevButton).toBeDisabled();
    expect(prevButton).toHaveClass('cursor-not-allowed');
    
    fireEvent.click(prevButton);
    expect(onPrev).not.toHaveBeenCalled();
  });
});
