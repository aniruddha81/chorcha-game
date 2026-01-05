import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Building, BuildingType } from "../app/index";

interface GridMapProps {
  gridSize: number;
  tileSize: number;
  buildings: Building[];
  onTilePress: (x: number, y: number) => void;
  selectedMode: boolean;
}

export const GridMap: React.FC<GridMapProps> = ({
  gridSize,
  tileSize,
  buildings,
  onTilePress,
  selectedMode,
}) => {
  const getBuildingAt = (x: number, y: number) => {
    return buildings.find((b) => b.x === x && b.y === y);
  };

  const renderBuildingIcon = (type: BuildingType) => {
    switch (type) {
      case "house":
        return "🏠";
      case "tree":
        return "🌲";
      case "road":
        return "🛣️";
      default:
        return "";
    }
  };

  const renderGrid = () => {
    const rows = [];
    for (let y = 0; y < gridSize; y++) {
      const cols = [];
      for (let x = 0; x < gridSize; x++) {
        const building = getBuildingAt(x, y);

        cols.push(
          <TouchableOpacity
            key={`${x}-${y}`}
            style={[
              styles.tile,
              { width: tileSize, height: tileSize },
              selectedMode && !building && styles.tileHover, // Visual cue for placement
            ]}
            activeOpacity={0.7}
            onPress={() => onTilePress(x, y)}
          >
            {building && (
              <Text style={[styles.buildingIcon, { fontSize: tileSize * 0.6 }]}>
                {renderBuildingIcon(building.type)}
              </Text>
            )}

            {/* Coordinates for debugging (optional) */}
            {/* <Text style={{fontSize: 8, color: '#ccc', position: 'absolute', bottom: 2, right: 2}}>{x},{y}</Text> */}
          </TouchableOpacity>
        );
      }
      rows.push(
        <View key={y} style={styles.row}>
          {cols}
        </View>
      );
    }
    return rows;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      maximumZoomScale={2.0}
      minimumZoomScale={0.5}
    >
      <ScrollView horizontal contentContainerStyle={styles.scrollContent}>
        <View style={styles.gridContainer}>{renderGrid()}</View>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#78c2ad", // Grass color background
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    minHeight: Dimensions.get("window").height * 0.6,
  },
  scrollContent: {
    padding: 20,
  },
  gridContainer: {
    borderWidth: 10,
    borderColor: "#5da08d",
    borderRadius: 4,
    backgroundColor: "#78c2ad",
  },
  row: {
    flexDirection: "row",
  },
  tile: {
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  tileHover: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  buildingIcon: {
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.3,
    // shadowRadius: 2,
  },
});
