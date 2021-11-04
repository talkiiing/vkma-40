export const isFunction = (
  functionToCheck: any,
): functionToCheck is Function => {
  return (
    functionToCheck && {}.toString.call(functionToCheck) === '[object Function]'
  )
}
