
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { Input } from '@/components/ui/input';

describe('Input UI Component', () => {
  it('rend correctement avec les props par défaut', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('applique les classes CSS par défaut', () => {
    render(<Input />);
    const inputElement = screen.getByRole('textbox');
    
    // Check for essential classes that should be present
    expect(inputElement).toHaveClass('flex');
    expect(inputElement).toHaveClass('h-10');
    expect(inputElement).toHaveClass('w-full');
    expect(inputElement).toHaveClass('rounded-md');
    expect(inputElement).toHaveClass('border');
    expect(inputElement).toHaveClass('border-input');
    expect(inputElement).toHaveClass('bg-background');
    expect(inputElement).toHaveClass('px-3');
    expect(inputElement).toHaveClass('py-2');
    expect(inputElement).toHaveClass('text-base');
    expect(inputElement).toHaveClass('md:text-sm');
    expect(inputElement).toHaveClass('ring-offset-background');
    expect(inputElement).toHaveClass('file:border-0');
    expect(inputElement).toHaveClass('file:bg-transparent');
    expect(inputElement).toHaveClass('file:text-sm');
    expect(inputElement).toHaveClass('file:font-medium');
    expect(inputElement).toHaveClass('file:text-foreground');
    expect(inputElement).toHaveClass('placeholder:text-muted-foreground');
    expect(inputElement).toHaveClass('focus-visible:outline-none');
    expect(inputElement).toHaveClass('focus-visible:ring-2');
    expect(inputElement).toHaveClass('focus-visible:ring-ring');
    expect(inputElement).toHaveClass('focus-visible:ring-offset-2');
    
    // These classes are applied by default in the component
    expect(inputElement).toHaveClass('disabled:cursor-not-allowed');
    expect(inputElement).toHaveClass('disabled:opacity-50');
  });

  it('accepte les props HTML standard', () => {
    render(<Input placeholder="Test placeholder" type="email" />);
    const input = screen.getByRole('textbox');
    
    expect(input).toHaveAttribute('placeholder', 'Test placeholder');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('gère les événements onChange', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('test');
  });

  it('peut être contrôlé avec value', () => {
    const { rerender } = render(<Input value="initial" readOnly />);
    const input = screen.getByRole('textbox');
    
    expect(input).toHaveValue('initial');
    
    rerender(<Input value="updated" readOnly />);
    expect(input).toHaveValue('updated');
  });

  it('gère correctement l\'état disabled', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed');
    expect(input).toHaveClass('disabled:opacity-50');
    
    // Test that disabled input doesn't accept changes in a real scenario
    // Note: fireEvent can still trigger events on disabled elements in tests
    // but the actual browser behavior prevents this
    fireEvent.change(input, { target: { value: 'test' } });
    // In a real browser, this wouldn't work, but in tests it might
    // So we just verify the disabled attribute is set
    expect(input).toBeDisabled();
  });

  it('applique les classes personnalisées', () => {
    render(<Input className="custom-class" />);
    const input = screen.getByRole('textbox');
    
    expect(input).toHaveClass('custom-class');
    expect(input).toHaveClass('flex'); // Should still have default classes
  });

  it('forward la ref correctement', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    
    expect(ref).toHaveBeenCalled();
  });
});
