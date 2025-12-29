import TroopCreateEditScreen from './create';

export default function TroopEditScreen() {
  // The create screen handles both create and edit based on the 'id' param
  // This file just provides the route /troop/edit?id=123
  return <TroopCreateEditScreen />;
}
