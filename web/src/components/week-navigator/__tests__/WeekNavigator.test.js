import { render, screen, fireEvent } from '@testing-library/react';
import WeekNavigator from '../WeekNavigator';

const mockWeek = {
  firstDay: '2026-05-01',
  lastDay: '2026-05-07'
};

describe('WeekNavigator component', () => {
  it('deshabilita el botón "anterior" cuando disablePrev es true', () => {
    const onPrev = jest.fn();
    render(<WeekNavigator currentWeek={mockWeek} onPrev={onPrev} disablePrev={true} />);
    
    const prevButton = screen.getAllByRole('button')[0];
    expect(prevButton).toBeDisabled();
    
    fireEvent.click(prevButton);
    expect(onPrev).not.toHaveBeenCalled();
  });

  it('deshabilita el botón "siguiente" cuando disableNext es true', () => {
    const onNext = jest.fn();
    render(<WeekNavigator currentWeek={mockWeek} onNext={onNext} disableNext={true} />);
    
    const nextButton = screen.getAllByRole('button')[1];
    expect(nextButton).toBeDisabled();
    
    fireEvent.click(nextButton);
    expect(onNext).not.toHaveBeenCalled();
  });

  it('habilita ambos botones por defecto', () => {
    const onPrev = jest.fn();
    const onNext = jest.fn();
    render(<WeekNavigator currentWeek={mockWeek} onPrev={onPrev} onNext={onNext} />);
    
    const [prevButton, nextButton] = screen.getAllByRole('button');
    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });
});
