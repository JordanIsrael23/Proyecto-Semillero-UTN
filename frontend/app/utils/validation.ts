/**
 * Valida si una cédula de identidad ecuatoriana (persona natural) es matemáticamente válida
 * siguiendo el algoritmo módulo 10 de la Dirección General de Registro Civil de Ecuador.
 * 
 * @param cedula Cadena de texto que contiene el número de cédula (debe tener 10 dígitos)
 * @returns true si la cédula es válida, false en caso contrario
 */
export function validarCedulaEcuatoriana(cedula: string): boolean {
  // 1. Debe tener exactamente 10 dígitos numéricos
  if (!/^\d{10}$/.test(cedula)) {
    return false;
  }

  // 2. Provincia (primeros 2 dígitos) debe estar en el rango de 01 a 24, o ser 30
  const provincia = parseInt(cedula.substring(0, 2), 10);
  if (provincia < 1 || (provincia > 24 && provincia !== 30)) {
    return false;
  }

  // 3. El tercer dígito para cédulas de personas naturales debe ser menor que 6 (0 a 5)
  const tercerDigito = parseInt(cedula.substring(2, 3), 10);
  if (tercerDigito >= 6) {
    return false;
  }

  // 4. Algoritmo Módulo 10 con coeficientes 2.1.2.1.2.1.2.1.2
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula.charAt(i), 10) * coeficientes[i];
    if (valor >= 10) {
      valor -= 9;
    }
    suma += valor;
  }

  // 5. El dígito verificador es el décimo dígito
  const digitoVerificadorInput = parseInt(cedula.charAt(9), 10);
  const residuo = suma % 10;
  const digitoVerificadorCalculado = residuo === 0 ? 0 : 10 - residuo;

  return digitoVerificadorCalculado === digitoVerificadorInput;
}
