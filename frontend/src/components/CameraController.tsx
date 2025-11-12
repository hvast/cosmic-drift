import * as THREE from 'three';

/**
 * Camera controller for smooth zoom and pan interactions
 */
export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private targetPosition: THREE.Vector3;
  private targetLookAt: THREE.Vector3;
  private currentLookAt: THREE.Vector3;
  private isDragging: boolean = false;
  private previousMousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private minDistance: number = 10;
  private maxDistance: number = 100;
  private smoothFactor: number = 0.1;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.targetPosition = camera.position.clone();
    this.targetLookAt = new THREE.Vector3(0, 0, 0);
    this.currentLookAt = new THREE.Vector3(0, 0, 0);
  }

  /**
   * Handle mouse wheel for zoom
   */
  handleWheel(event: WheelEvent): void {
    event.preventDefault();

    const zoomSpeed = 0.1;
    const delta = event.deltaY > 0 ? 1 : -1;
    
    // Calculate zoom direction
    const direction = new THREE.Vector3();
    direction.subVectors(this.targetPosition, this.targetLookAt).normalize();
    
    // Apply zoom
    const newDistance = this.targetPosition.distanceTo(this.targetLookAt) + delta * zoomSpeed * 5;
    
    // Clamp distance
    const clampedDistance = Math.max(this.minDistance, Math.min(this.maxDistance, newDistance));
    
    this.targetPosition.copy(this.targetLookAt).add(direction.multiplyScalar(clampedDistance));
  }

  /**
   * Handle mouse down for drag start
   */
  handleMouseDown(event: MouseEvent): void {
    if (event.button === 0) { // Left click
      this.isDragging = true;
      this.previousMousePosition = { x: event.clientX, y: event.clientY };
    }
  }

  /**
   * Handle mouse move for panning
   */
  handleMouseMove(event: MouseEvent, _containerWidth: number, _containerHeight: number): void {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.previousMousePosition.x;
    const deltaY = event.clientY - this.previousMousePosition.y;

    // Calculate pan speed based on distance from target
    const distance = this.camera.position.distanceTo(this.targetLookAt);
    const panSpeed = distance * 0.001;

    // Get camera right and up vectors
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    
    this.camera.getWorldDirection(new THREE.Vector3());
    right.setFromMatrixColumn(this.camera.matrix, 0);
    up.setFromMatrixColumn(this.camera.matrix, 1);

    // Apply panning
    const panOffset = new THREE.Vector3();
    panOffset.add(right.multiplyScalar(-deltaX * panSpeed));
    panOffset.add(up.multiplyScalar(deltaY * panSpeed));

    this.targetPosition.add(panOffset);
    this.targetLookAt.add(panOffset);

    this.previousMousePosition = { x: event.clientX, y: event.clientY };
  }

  /**
   * Handle mouse up for drag end
   */
  handleMouseUp(): void {
    this.isDragging = false;
  }

  /**
   * Smoothly transition to look at a specific point
   */
  focusOn(position: THREE.Vector3, distance: number = 15): void {
    const direction = new THREE.Vector3();
    direction.subVectors(this.camera.position, this.currentLookAt).normalize();
    
    this.targetLookAt.copy(position);
    this.targetPosition.copy(position).add(direction.multiplyScalar(distance));
  }

  /**
   * Reset camera to default position
   */
  reset(): void {
    this.targetPosition.set(0, 20, 50);
    this.targetLookAt.set(0, 0, 0);
  }

  /**
   * Update camera position with smooth interpolation
   */
  update(): void {
    // Smooth camera position
    this.camera.position.lerp(this.targetPosition, this.smoothFactor);
    
    // Smooth look-at target
    this.currentLookAt.lerp(this.targetLookAt, this.smoothFactor);
    this.camera.lookAt(this.currentLookAt);
  }

  /**
   * Get current drag state
   */
  getIsDragging(): boolean {
    return this.isDragging;
  }
}

/**
 * Setup camera controls on a container element
 */
export function setupCameraControls(
  container: HTMLElement,
  camera: THREE.PerspectiveCamera
): CameraController {
  const controller = new CameraController(camera);

  const handleWheel = (e: WheelEvent) => controller.handleWheel(e);
  const handleMouseDown = (e: MouseEvent) => controller.handleMouseDown(e);
  const handleMouseMove = (e: MouseEvent) =>
    controller.handleMouseMove(e, container.clientWidth, container.clientHeight);
  const handleMouseUp = () => controller.handleMouseUp();

  container.addEventListener('wheel', handleWheel, { passive: false });
  container.addEventListener('mousedown', handleMouseDown);
  container.addEventListener('mousemove', handleMouseMove);
  container.addEventListener('mouseup', handleMouseUp);
  container.addEventListener('mouseleave', handleMouseUp);

  // Return controller with cleanup function
  return controller;
}
