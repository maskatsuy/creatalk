import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './button'

describe('Button Component', () => {
  it('should render with default props', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-primary')
  })

  it('should render with different variants', () => {
    render(<Button variant="destructive">Delete</Button>)
    
    const button = screen.getByRole('button', { name: /delete/i })
    expect(button).toHaveClass('bg-destructive')
  })

  it('should render with different sizes', () => {
    render(<Button size="sm">Small</Button>)
    
    const button = screen.getByRole('button', { name: /small/i })
    expect(button).toHaveClass('h-8')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    
    const button = screen.getByRole('button', { name: /disabled/i })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none')
  })

  it('should handle click events', async () => {
    const user = userEvent.setup()
    let clicked = false
    
    render(
      <Button onClick={() => { clicked = true }}>
        Clickable
      </Button>
    )
    
    const button = screen.getByRole('button', { name: /clickable/i })
    await user.click(button)
    
    expect(clicked).toBe(true)
  })

  it('should not handle click when disabled', async () => {
    const user = userEvent.setup()
    let clicked = false
    
    render(
      <Button disabled onClick={() => { clicked = true }}>
        Disabled Click
      </Button>
    )
    
    const button = screen.getByRole('button', { name: /disabled click/i })
    await user.click(button)
    
    expect(clicked).toBe(false)
  })

  it('should render as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    
    const link = screen.getByRole('link', { name: /link button/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('should merge custom className with default classes', () => {
    render(<Button className="custom-class">Custom</Button>)
    
    const button = screen.getByRole('button', { name: /custom/i })
    expect(button).toHaveClass('custom-class')
    expect(button).toHaveClass('bg-primary') // default class should still be there
  })
})