/**
 * RoleBasedButton
 * Renders children (a button) only when the current user has
 * the required permission.  Silently returns null otherwise.
 *
 * Usage:
 *   <RoleBasedButton resource="vehicles" action="delete">
 *     <Button variant="destructive">Delete</Button>
 *   </RoleBasedButton>
 *
 *   OR shorthand props:
 *   <RoleBasedButton resource="vehicles" action="create" className="..." onClick={fn}>
 *     Add Vehicle
 *   </RoleBasedButton>
 */
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'

export default function RoleBasedButton({
  resource,
  action,
  children,
  // If no child node is passed the component acts as a <Button> wrapper
  asButton = true,
  className,
  ...rest
}) {
  const { hasPermission } = useAuth()

  if (!hasPermission(resource, action)) return null

  // If children is already a React element (e.g. <Button>) just return it
  if (!asButton) return <>{children}</>

  return (
    <Button className={className} {...rest}>
      {children}
    </Button>
  )
}
