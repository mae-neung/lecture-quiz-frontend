import { Button as DevupButton } from '@devup-ui/react'

function Button({ children, className = '', type = 'button', variant = 'primary', ...props }) {
  const isDanger = variant === 'danger'
  const isSecondary = variant === 'secondary'

  return (
    <DevupButton
      bg={isDanger ? '$danger' : isSecondary ? '$surface' : '$accent'}
      borderColor={isSecondary ? '$border' : 'transparent'}
      borderRadius="$controlRadius"
      borderStyle="solid"
      borderWidth="1px"
      className={className}
      color={isSecondary ? '$text' : '$onAccent'}
      cursor="pointer"
      fontWeight={700}
      lineHeight={1.5}
      minH="$controlHeight"
      outlineColor="$focusRing"
      px="$controlPaddingX"
      py="$controlPaddingY"
      type={type}
      _disabled={{ cursor: 'not-allowed', opacity: 0.5 }}
      _focusVisible={{ outlineOffset: '3px', outlineStyle: 'solid', outlineWidth: '3px' }}
      _hover={{ bg: isDanger ? '$dangerHover' : isSecondary ? '$surfaceMuted' : '$accentHover' }}
      {...props}
    >
      {children}
    </DevupButton>
  )
}

export default Button
